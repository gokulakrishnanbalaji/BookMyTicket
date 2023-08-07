from flask import Flask, render_template, request, redirect, url_for, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity,get_jwt
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os
import redis
from datetime import timedelta
import matplotlib.pyplot as plt
from io import BytesIO
from celery_worker import make_celery
from celery.result import AsyncResult
from celery.schedules import crontab
import csv
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from fpdf import FPDF

SMPTP_SERVER_HOST = "localhost"
SMPTP_SERVER_PORT = 1025
SENDER_ADDRESS = "gokulakrishnan@gmail.com"
SENDER_PASSWORD = ""

def send_email(to_address, subject, message, content="text", attachment_file=None):
    msg = MIMEMultipart()
    msg["From"] = SENDER_ADDRESS
    msg["To"] = to_address
    msg["Subject"] = subject

    if content == "html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))

    if attachment_file:
        with open(attachment_file, "rb") as attachment:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition", f"attachment; filename= {attachment_file}",
        )
        msg.attach(part)

    s = smtplib.SMTP(host=SMPTP_SERVER_HOST, port=SMPTP_SERVER_PORT)
   
    s.login(SENDER_ADDRESS, SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRETKEY']='secret'
app.config["JWT_SECRET_KEY"] = "super-secret"

ACCESS_EXPIRES = timedelta(hours=6)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = ACCESS_EXPIRES

app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379/1'
)
celery = make_celery(app)


db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

jwt_redis_blocklist = redis.StrictRedis(
    host="localhost", port=6379, db=0, decode_responses=True
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True,auto_increment=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password_hash = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    is_admin = db.Column(db.Boolean, default=False)

class Theatre(db.Model):
    __tablename__ = 'theatre'
    id = db.Column(db.Integer, primary_key=True,auto_increment=True)
    name = db.Column(db.String(20), nullable=False, unique=True)
    address = db.Column(db.String(100), nullable=False, unique=True)
    city = db.Column(db.String(100), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)

class Show(db.Model):
    __tablename__ = 'show'
    id = db.Column(db.Integer, primary_key=True,auto_increment=True)
    name = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    genre = db.Column(db.String(100), nullable=False)
    theatre_id = db.Column(db.Integer, db.ForeignKey('theatre.id'), nullable=False)
    timing = db.Column(db.String, nullable=False)
    remaining_capacity=db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    tags=db.Column(db.String)


class Booking(db.Model):
    __tablename__ = 'booking'
    id = db.Column(db.Integer, primary_key=True,auto_increment=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    show_id = db.Column(db.Integer, db.ForeignKey('show.id'), nullable=False)
    tickets = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Integer, nullable=True)

with app.app_context():
    if not os.path.exists('database.db'):
        db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data['username'] or not data['password']:
        return jsonify({'message': 'Please provide username and password!'}),400
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({'message': 'User not found!'}),404
    if bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        if user.is_admin:
            is_admin=True
        else:
            is_admin= False

        send_email_for_login.delay(user.email, user.username)
        return jsonify({'message': 'Logged in as {}'.format(user.username),
            'access_token': access_token,
            'username': user.username,
            'email': user.email,
            'is_admin': is_admin,
            'user': user.id,
        }),200
    else:
        return jsonify({'message': 'Wrong credentials!'}),401
    
@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    jti = jwt_payload["jti"]
    token_in_redis = jwt_redis_blocklist.get(jti)
    return token_in_redis is not None

@app.route("/api/logout", methods=["DELETE"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    jwt_redis_blocklist.set(jti, "", ex=ACCESS_EXPIRES)
    return jsonify(msg="Access token revoked")


@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()

    if not users:
        return jsonify({'message': 'No users found!'}),404
    
    output = []
    for user in users:
        user_data = {}
        user_data['id'] = user.id
        user_data['username'] = user.username
        user_data['password_hash'] = user.password_hash
        user_data['email'] = user.email
        user_data['is_admin'] = user.is_admin
        output.append(user_data)
    return jsonify({'users': output}),200

@app.route('/api/users/<id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'User not found!'}),404
    
    data = request.get_json()

    if data['username']:
        user.username = data['username']
    if data['email']:
        user.email = data['email']

    if data['old_password'] and data['new_password']:
        if bcrypt.check_password_hash(user.password_hash, data['old_password']):
            hashed_password = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')
            user.password_hash = hashed_password
        else:
            return jsonify({'message': 'Wrong password!'}),401

    db.session.commit()
    return jsonify({'message': 'User updated!'}),200

@app.route('/api/users/<id>', methods=['GET'])
@jwt_required()
def get_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'User not found!'}),404
    user_data = {}
    user_data['id'] = user.id
    user_data['username'] = user.username
    user_data['password_hash'] = user.password_hash
    user_data['email'] = user.email
    user_data['is_admin'] = user.is_admin
    user_data['password']=user.password_hash
    return jsonify({'user': user_data}),200

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or not data['username'] or not data['password'] or not data['email']:
        return jsonify({'message': 'Please provide username, password and email!'}),400
    
    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({'message': 'Please provide a valid email!'}),400
    
    old_user = User.query.filter_by(username=data['username']).first()

    if old_user:
        return jsonify({'message': 'User already exists!'}),409

    
    print(f"is admin : {data['is_admin']}")
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password_hash=hashed_password, email=data['email'], is_admin=data["is_admin"])

    db.session.add(new_user)
    db.session.commit()

    send_email_for_registration.delay(data['email'], data['username'])
    return jsonify({'message': 'New user created!'}),200

@app.route('/api/user/<id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'User not found!'}),404
    bookings = Booking.query.filter_by(user_id=id).all()

    for booking in bookings:
        db.session.delete(booking)
    theatres = Theatre.query.filter_by(user_id=id).all()

    for theatre in theatres:
        shows = Show.query.filter_by(theatre_id=theatre.id).all()
        for show in shows:
            bookings = Booking.query.filter_by(show_id=show.id).all()
            for booking in bookings:
                db.session.delete(booking)

            db.session.delete(show)

        db.session.delete(theatre)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted!'}),200

@app.route('/api/theatres', methods=['GET'])
@jwt_required()
def get_theatres():
    theatres = Theatre.query.all()

    if not theatres:
        return jsonify({'message': 'No theatres found!'}),404
    
    output = []
    for theatre in theatres:
        theatre_data = {}
        theatre_data['id'] = theatre.id
        theatre_data['name'] = theatre.name
        theatre_data['address'] = theatre.address
        theatre_data['city'] = theatre.city
        theatre_data['user_id'] = theatre.user_id
        theatre_data['capacity'] = theatre.capacity

        output.append(theatre_data)
    return jsonify({'theatres': output}),200

@app.route('/api/theatre/<id>', methods=['GET'])
@jwt_required()
def get_theatre(id):
    theatre = Theatre.query.get(id)
    if not theatre:
        return jsonify({'message': 'Theatre not found!'}),404
    theatre_data = {}
    theatre_data['id'] = theatre.id
    theatre_data['name'] = theatre.name
    theatre_data['address'] = theatre.address
    theatre_data['city'] = theatre.city
    theatre_data['user_id'] = theatre.user_id
    theatre_data['capacity'] = theatre.capacity
    return jsonify({'theatre': theatre_data}),200


@app.route('/api/admin_theatres', methods=['GET'])
@jwt_required()
def get_admin_theatres():
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can create theatres!'}),401
    
    theatres = Theatre.query.filter_by(user_id=current_user_id).all()

    if not theatres:
        return jsonify({'message': 'No theatres found!'}),404
    
    output = []
    for theatre in theatres:
        theatre_data = {}
        theatre_data['id'] = theatre.id
        theatre_data['name'] = theatre.name
        theatre_data['address'] = theatre.address
        theatre_data['city'] = theatre.city
        theatre_data['user_id'] = theatre.user_id
        theatre_data['capacity'] = theatre.capacity

        output.append(theatre_data)
    return jsonify({'theatres': output}),200


@app.route('/api/delete_theatre/<id>', methods=['DELETE'])
@jwt_required()
def delete_theatre(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can delete theatres!'}),401
    
    theatre = Theatre.query.get(id)
    if not theatre:
        return jsonify({'message': 'Theatre not found!'}),404
    
    if theatre.user_id != current_user_id:
        return jsonify({'message': 'Only admin of theatre can delete theatre!'}),401
    
    shows = Show.query.filter_by(theatre_id=id).all()
    for show in shows:
        bookings = Booking.query.filter_by(show_id=show.id).all()
        for booking in bookings:
            db.session.delete(booking)

        db.session.delete(show)

    db.session.delete(theatre)
    db.session.commit()
    return jsonify({'message': 'Theatre deleted!'}),200

@app.route('/api/theatres', methods=['POST'])
@jwt_required()
def create_theatre():
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can create theatres!'}),401
    
    data = request.get_json()
    old_theatre = Theatre.query.filter_by(name=data['name']).first()

    if old_theatre:
        return jsonify({'message': 'Theatre already exists!'}),409
    
    new_theatre = Theatre(name=data['name'], address=data['address'], city=data['city'], user_id=current_user_id, capacity=data['capacity'])

    db.session.add(new_theatre)
    db.session.commit()
    return jsonify({'message': 'New theatre created!'}),200

@app.route('/api/update_theatre/<id>', methods=['PUT'])
@jwt_required()
def update_theatre(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can update theatres!'}),401
    
    theatre = Theatre.query.get(id)
    if not theatre:
        return jsonify({'message': 'Theatre not found!'}),404
    
    if theatre.user_id != current_user_id:
        return jsonify({'message': 'Only admin of theatre can update theatre!'}),401
    
    data = request.get_json()

    shows = Show.query.filter_by(theatre_id=id).all()
    max_capacity = 0
    for show in shows:
        if show.remaining_capacity > max_capacity:
            max_capacity = show.remaining_capacity

    if max_capacity > int(data['capacity']):
        return jsonify({'message': 'Already seats booked higher than the new capacity'}),409

    theatre.name = data['name']
    theatre.address = data['address']
    theatre.city = data['city']
    theatre.capacity = data['capacity']

    db.session.commit()
    return jsonify({'message': 'Theatre updated!'}),200

@app.route('/api/shows', methods=['GET'])
@jwt_required()
def get_shows():
    shows = Show.query.all()

    if not shows:
        return jsonify({'message': 'No shows found!'}),404
    
    output = []
    for show in shows:
        show_data = {}
        show_data['id'] = show.id
        show_data['name'] = show.name
        show_data['duration'] = show.duration
        show_data['genre'] = show.genre
        show_data['theatre_id'] = show.theatre_id
        show_data['timing'] = show.timing
        show_data['remaining_capacity'] = show.remaining_capacity
        show_data['price'] = show.price
        show_data['tags']=show.tags

        output.append(show_data)
    return jsonify({'shows': output}),200

@app.route('/api/show/<id>', methods=['GET'])
@jwt_required()
def get_show(id):
    show = Show.query.get(id)
    if not show:
        return jsonify({'message': 'Show not found!'}),404
    show_data = {}
    show_data['id'] = show.id
    show_data['name'] = show.name
    show_data['duration'] = show.duration
    show_data['genre'] = show.genre
    show_data['theatre_id'] = show.theatre_id
    show_data['timing'] = show.timing
    show_data['remaining_capacity'] = show.remaining_capacity
    show_data['price'] = show.price
    show_data['tags']=show.tags

    return jsonify({'show': show_data}),200

@app.route('/api/shows/<theatre_id>', methods=['GET'])
@jwt_required()
def get_shows_by_theatre(theatre_id):
    theatre = Theatre.query.get(theatre_id)
    if not theatre:
        return jsonify({'message': 'Theatre not found!'}),404
    shows = Show.query.filter_by(theatre_id=theatre_id).all()

    if not shows:
        return jsonify({'message': 'No shows found!'}),404
    
    output = []
    for show in shows:
        show_data = {}
        show_data['id'] = show.id
        show_data['name'] = show.name
        show_data['duration'] = show.duration
        show_data['genre'] = show.genre
        show_data['theatre_id'] = show.theatre_id
        show_data['timing'] = show.timing
        show_data['remaining_capacity'] = show.remaining_capacity
        show_data['price'] = show.price
        show_data['tags']=show.tags

        output.append(show_data)
    return jsonify({'shows': output}),200

@app.route('/api/shows', methods=['POST'])
@jwt_required()
def create_show():
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can create shows!'}),401
    
    data = request.get_json()

    theatre = Theatre.query.get(data['theatre_id'])
    if not theatre:
        return jsonify({'message': 'Theatre not found!'}),404
    
    if theatre.user_id != current_user_id:
        return jsonify({'message': 'Only admin of theatre can create shows!'}),401

    start_time = datetime.strptime(data['timing'], '%H:%M')
    end_time = start_time + timedelta(minutes=int(data['duration']))
    end_time = end_time.strftime('%H:%M')
    start_time = start_time.strftime('%H:%M')

    shows = Show.query.filter_by(theatre_id=data['theatre_id']).all()
    for show in shows:
        show_start_time=datetime.strptime(show.timing, '%H:%M')
        show_end_time = show_start_time + timedelta(minutes=show.duration)
        show_start_time = show_start_time.strftime('%H:%M')
        show_end_time = show_end_time.strftime('%H:%M')

        if (start_time >= show_start_time and start_time <= show_end_time) or (end_time >= show_start_time and end_time <= show_end_time):
            return jsonify({'message': 'Show timing clashes with another show!'}),409


    new_show = Show(name=data['name'], duration=data['duration'], genre=data['genre'], theatre_id=data['theatre_id'], timing=data['timing'], remaining_capacity=theatre.capacity, price=data['price'], tags=data['tags'])

    db.session.add(new_show)
    db.session.commit()
    return jsonify({'message': 'New show created!'}),200


@app.route('/api/book_show', methods=['POST'])
@jwt_required()
def book_show():
    data = request.get_json()
    show = Show.query.get(data['show_id'])

    if not show:
        return jsonify({'message': 'Show not found!'}),404
    if show.remaining_capacity == 0:
        return jsonify({'message': 'Show is full!'}),409

    
    show.remaining_capacity -= int(data['tickets'])
    new_booking = Booking(user_id=get_jwt_identity(), show_id=data['show_id'], tickets=data['tickets'])
    db.session.add(new_booking)
    db.session.commit()
    #email, username, theatre_name, show_name, show_timing, tickets
    email=User.query.get(get_jwt_identity()).email
    username=User.query.get(get_jwt_identity()).username
    theatre_name=Theatre.query.get(show.theatre_id).name
    show_name=show.name
    show_timing=show.timing
    tickets=data['tickets']
    send_email_for_booking.delay(email, username, theatre_name, show_name, show_timing, tickets)


    return jsonify({'message': 'Tickets booked!'}),200

@app.route('/api/show/<id>', methods=['PUT'])
@jwt_required()
def update_show(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can update shows!'}),401
    
    show = Show.query.get(id)
    if not show:
        return jsonify({'message': 'Show not found!'}),404
    
    theatre_admin_id = Theatre.query.get(show.theatre_id).user_id
    
    if theatre_admin_id != current_user_id:
        return jsonify({'message': 'Only admin of theatre can update show!'}),401
    
    data = request.get_json()

    start_time = datetime.strptime(data['timing'], '%H:%M')
    end_time = start_time + timedelta(minutes=int(data['duration']))
    end_time = end_time.strftime('%H:%M')
    start_time = start_time.strftime('%H:%M')

    shows = Show.query.filter_by(theatre_id=show.theatre_id).all()
    for show in shows:
        if int(show.id) != int(id):
            print(show.id , id)
            show_start_time=datetime.strptime(show.timing, '%H:%M')
            show_end_time = show_start_time + timedelta(minutes=show.duration)
            show_start_time = show_start_time.strftime('%H:%M')
            show_end_time = show_end_time.strftime('%H:%M')

            if (start_time >= show_start_time and start_time <= show_end_time) or (end_time >= show_start_time and end_time <= show_end_time):
                return jsonify({'message': 'Show timing clashes with another show!'}),409

    show.name = data['name']
    show.duration = data['duration']
    show.genre = data['genre']
    show.timing = data['timing']
    show.price = data['price']
    show.tags=data['tags']

    db.session.commit()
    return jsonify({'message': 'Show updated!'}),200


@app.route('/api/show/<id>', methods=['DELETE'])
@jwt_required()
def delete_show(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can delete shows!'}),401
    
    show = Show.query.get(id)
    if not show:
        return jsonify({'message': 'Show not found!'}),404
    
    theatre_admin_id = Theatre.query.get(show.theatre_id).user_id
    
    if theatre_admin_id != current_user_id:
        return jsonify({'message': 'Only admin of theatre can delete show!'}),401
    
    bookings = Booking.query.filter_by(show_id=id).all()
    for booking in bookings:
        db.session.delete(booking)

    db.session.delete(show)
    db.session.commit()
    return jsonify({'message': 'Show deleted!'}),200

@app.route('/api/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    current_user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=current_user_id).all()

    if not bookings:
        return jsonify({'message': 'No bookings found!'}),404
    
    output = []
    for booking in bookings:
        theatre_name = Theatre.query.get(Show.query.get(booking.show_id).theatre_id).name
        show_name = Show.query.get(booking.show_id).name
        show_timing=Show.query.get(booking.show_id).timing
        booking_data = {}
        booking_data['id'] = booking.id
        booking_data['theatre_name'] = theatre_name
        booking_data['show_name'] = show_name
        booking_data['tickets'] = booking.tickets
        booking_data['rating'] = booking.rating
        booking_data['show_timing'] = show_timing

        output.append(booking_data)
    return jsonify({'bookings': output}),200

@app.route('/api/rate_show', methods=['POST'])
@jwt_required()
def rate_show():
    data = request.get_json()
    booking = Booking.query.get(data['booking_id'])

    if not booking:
        return jsonify({'message': 'Booking not found!'}),404

    
    booking.rating = data['rating']
    db.session.commit()
    return jsonify({'message': 'Show rated!'}),200

generated_images = []
@app.route('/api/summary', methods=['POST'])
@jwt_required()
def get_summary():
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can get summary!'}),401
    
    theatres = Theatre.query.filter_by(user_id=current_user_id).all()

    if not theatres:
        return jsonify({'message': 'No theatres found!'}),404
    
    unique_shows = []
    for theatre in theatres:
        shows = Show.query.filter_by(theatre_id=theatre.id).all()
        for show in shows:
            if show.name not in unique_shows:
                unique_shows.append(show.name)

    global generated_images
    generated_images = []

    for show in unique_shows:
        ratings = []
        shows = Show.query.filter_by(name=show).all()
        for show in shows:
            bookings = Booking.query.filter_by(show_id=show.id).all()
            for booking in bookings:
                if booking.rating:
                    ratings.append(booking.rating)

        plt.bar([0,1,2,3,4,5], [ratings.count(0),ratings.count(1),ratings.count(2),ratings.count(3),ratings.count(4),ratings.count(5)])
        plt.xlabel('Ratings')
        plt.ylabel('Frequency')
        plt.title(f'Rating distribution for {show.name}')
        
        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        plt.close()

        generated_images.append(buffer)
    
    filenames = [f'image_{i}.png' for i in range(len(generated_images))]

    return jsonify({"filenames": filenames}), 200, {"Content-Type": "application/json"}


@app.route('/get_image/<filename>', methods=['GET'])
def get_image(filename):
    index = int(filename.split("_")[1].split(".")[0])
    
    return send_file(generated_images[index], mimetype='image/png')
  
@app.route('/api/search', methods=['POST'])
@jwt_required()
def search():
    data = request.get_json()
    
    if data['theatre_name']:
        theatres = Theatre.query.filter(Theatre.name.like(f'%{data["theatre"]}%')).all()
        print(theatres,data['theatre_name'])
    else:
        theatres = Theatre.query.filter(Theatre.city.like(f'%{data["theatre"]}%')).all()

    if not theatres:
        return jsonify({'message': 'No theatres found!'}),404

    if not data['show']:
        output = []
        for theatre in theatres:
            theatre_data = {}
            theatre_data['id'] = theatre.id
            theatre_data['name'] = theatre.name
            theatre_data['address'] = theatre.address
            theatre_data['city'] = theatre.city
            theatre_data['user_id'] = theatre.user_id
            theatre_data['capacity'] = theatre.capacity

            output.append(theatre_data)
        return jsonify({'theatres': output}),200
    
    if data['show_name']:
        output = []
        for theatre in theatres:
            shows = Show.query.filter(Show.name.like(f'%{data["show"]}%'),Show.theatre_id==theatre.id).all()
            print(shows)
            if not shows:
                return jsonify({'message': 'No shows found!'}),404
            
            for show in shows:
                show_data = {}
                show_data['id'] = show.id
                show_data['name'] = show.name
                show_data['duration'] = show.duration
                show_data['genre'] = show.genre
                show_data['theatre_id'] = show.theatre_id
                show_data['timing'] = show.timing
                show_data['remaining_capacity'] = show.remaining_capacity
                show_data['price'] = show.price
                show_data['tags']=show.tags
                show_data['theatre_name']=theatre.name
                show_data['city']=theatre.city

                output.append(show_data)
        return jsonify({'shows': output}),200
        
    elif data['show_tags']:
        output = []
        for theatre in theatres:
            
            shows = Show.query.filter(Show.tags.like(f'%{data["show"]}%'),Show.theatre_id==theatre.id).all()
            if not shows:
                return jsonify({'message': 'No shows found!'}),404
            
            for show in shows:
                show_data = {}
                show_data['id'] = show.id
                show_data['name'] = show.name
                show_data['duration'] = show.duration
                show_data['genre'] = show.genre
                show_data['theatre_id'] = show.theatre_id
                show_data['timing'] = show.timing
                show_data['remaining_capacity'] = show.remaining_capacity
                show_data['price'] = show.price
                show_data['tags']=show.tags
                show_data['theatre_name']=theatre.name
                show_data['city']=theatre.city

                output.append(show_data)
        return jsonify({'shows': output}),200
        
    else:
        rating = int(data['show'])
        output = []
        for theatre in theatres:
            shows = Show.query.filter(Show.theatre_id==theatre.id).all()
            if not shows:
                return jsonify({'message': 'No shows found!'}),404
            
            for show in shows:
                bookings = Booking.query.filter_by(show_id=show.id).all()
                total_rating = 0
                for booking in bookings:
                    if booking.rating:
                        total_rating += booking.rating
                if len(bookings) != 0:
                    avg_rating = total_rating/len(bookings)
                else:
                    avg_rating = 0
                if avg_rating >= rating:
                    show_data = {}
                    show_data['id'] = show.id
                    show_data['name'] = show.name
                    show_data['duration'] = show.duration
                    show_data['genre'] = show.genre
                    show_data['theatre_id'] = show.theatre_id
                    show_data['timing'] = show.timing
                    show_data['remaining_capacity'] = show.remaining_capacity
                    show_data['price'] = show.price
                    show_data['tags']=show.tags
                    show_data['theatre_name']=theatre.name
                    show_data['city']=theatre.city

                    output.append(show_data)
        return jsonify({'shows': output}),200
        
        
    return jsonify({'message': 'No shows found!'}),404

@celery.task(name="generate_csv")
def generate_csv(current_user_id):
    theatres = Theatre.query.filter_by(user_id=current_user_id).all()
    with open('static/theatres.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Theatre Name", "Theatre City", "Show Name", "Show Timing", "Show Price"])
        for theatre in theatres:
            shows = Show.query.filter_by(theatre_id=theatre.id).all()
            if shows != []:
                for show in shows:
                    writer.writerow([theatre.name, theatre.city, show.name, show.timing, show.price])
            else:
                writer.writerow([theatre.name, theatre.city, "No shows", "No shows", "No shows"])
    return 'done'

@app.route('/api/generate_csv', methods=['GET'])
@jwt_required()
def download_csv():
    current_user_id = get_jwt_identity()
    current_user = User.query.get_or_404(current_user_id)

    if not current_user.is_admin:
        return jsonify({'message': 'Only admin can download csv!'}),401
    
    task = generate_csv.delay(current_user_id)
    return jsonify({'task_id': task.id , 'state': task.state}),200

@app.route('/status/<id>')
def taskstatus(id):
    task = generate_csv.AsyncResult(id)
    return jsonify({
        "Task_ID": task.id,
        "Task_State": task.state,
        "Task_Result": task.result
    })


@celery.task(name="send_email_for_login")
def send_email_for_login(email, username):
     send_email(
        to_address=email,
        subject="Login Successful",
        message=f"Hi {username}, You have logged into your account. Thank you for using our service."
    )
     return "Login email sholud be sent"

@celery.task(name="send_email_for_registration")
def send_email_for_registration(email, username):
        send_email(
            to_address=email,
            subject="Registration Successful",
            message=f"Hi {username}, You have registered into your account. Thank you for using our service."
        )
        return "Registration email sholud be sent"

@celery.task(name="send_email_for_booking")
def send_email_for_booking(email, username, theatre_name, show_name, show_timing, tickets):
        send_email(
            to_address=email,
            subject="Booking Confirmation",
            message=f"Hi {username}, You have booked {tickets} tickets for {show_name} at {theatre_name} on {show_timing}. Thank you for using our service."
        )
        return "Booking email sholud be sent"

@celery.task(name="send_report")
def send_report():
    users = User.query.filter_by(is_admin=False).all()
    for user in users:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        bookings = Booking.query.filter_by(user_id=user.id).all()
        pdf.cell(200, 10, txt=f"Hi {user.username}, here is your report", ln=1, align="C")
        pdf.cell(200, 10, txt=f"Your bookings are:", ln=1, align="C")
        for booking in bookings:
            show = Show.query.get(booking.show_id)
            theatre = Theatre.query.get(show.theatre_id)
            pdf.cell(200, 10, txt=f"{show.name} at {theatre.name} on {show.timing}", ln=1, align="C")
        pdf.output(f"static/{user.username}.pdf")
        send_email(
            to_address=user.email,
            subject="Your report",
            message=f"Hi {user.username}, here is your report",
            attachment_file=f"static/{user.username}.pdf",
            content="application/pdf"
        )
        os.remove(f"static/{user.username}.pdf")

    return "Report should be sent"


@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    

    sender.add_periodic_task(
        crontab(hour=23, minute=59, day_of_month=28),
        send_report.s(),
    )

    
    sender.add_periodic_task(
        crontab(hour=16, minute=30),
        send_report.s(),
    )





if __name__ == '__main__':
    app.run(debug=True)