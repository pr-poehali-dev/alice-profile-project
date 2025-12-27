import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления сообщениями пользователей"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            email = body.get('email')
            message = body.get('message')
            
            if not name or not message:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name and message are required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO messages (name, email, message) VALUES (%s, %s, %s) RETURNING id",
                    (name, email, message)
                )
                message_id = cur.fetchone()[0]
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': message_id, 'message': 'Message sent successfully'}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            admin_password = event.get('headers', {}).get('x-admin-password') or event.get('headers', {}).get('X-Admin-Password')
            
            if admin_password != os.environ.get('ADMIN_PASSWORD'):
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM messages ORDER BY created_at DESC")
                messages = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(m) for m in messages], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            admin_password = event.get('headers', {}).get('x-admin-password') or event.get('headers', {}).get('X-Admin-Password')
            
            if admin_password != os.environ.get('ADMIN_PASSWORD'):
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            message_id = body.get('id')
            is_read = body.get('is_read')
            
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE messages SET is_read = %s WHERE id = %s",
                    (is_read, message_id)
                )
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Message updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            admin_password = event.get('headers', {}).get('x-admin-password') or event.get('headers', {}).get('X-Admin-Password')
            
            if admin_password != os.environ.get('ADMIN_PASSWORD'):
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            query_params = event.get('queryStringParameters', {})
            message_id = query_params.get('id') if query_params else None
            
            with conn.cursor() as cur:
                cur.execute("DELETE FROM messages WHERE id = %s", (message_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Message deleted'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
