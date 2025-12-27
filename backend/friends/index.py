import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления заявками в друзья"""
    
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
            description = body.get('description')
            avatar_url = body.get('avatar_url')
            
            if not name or not description:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name and description are required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO friend_requests (name, description, avatar_url) VALUES (%s, %s, %s) RETURNING id",
                    (name, description, avatar_url)
                )
                request_id = cur.fetchone()[0]
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': request_id, 'message': 'Friend request created'}),
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
                cur.execute("SELECT * FROM friend_requests ORDER BY created_at DESC")
                requests = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(r) for r in requests], default=str),
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
            request_id = body.get('id')
            status = body.get('status')
            
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE friend_requests SET status = %s WHERE id = %s",
                    (status, request_id)
                )
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Status updated'}),
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
            request_id = query_params.get('id') if query_params else None
            
            with conn.cursor() as cur:
                cur.execute("DELETE FROM friend_requests WHERE id = %s", (request_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Request deleted'}),
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
