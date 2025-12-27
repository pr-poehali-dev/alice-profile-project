import json
import os
import base64
import boto3
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для загрузки аватарок в S3"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = json.loads(event.get('body', '{}'))
    file_data = body.get('file')
    file_name = body.get('fileName', 'avatar.jpg')
    
    if not file_data:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'File data is required'}),
            'isBase64Encoded': False
        }
    
    file_bytes = base64.b64decode(file_data.split(',')[1] if ',' in file_data else file_data)
    
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    key = f'avatars/{timestamp}_{file_name}'
    
    content_type = 'image/jpeg'
    if file_name.lower().endswith('.png'):
        content_type = 'image/png'
    elif file_name.lower().endswith('.gif'):
        content_type = 'image/gif'
    
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=file_bytes,
        ContentType=content_type
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'url': cdn_url}),
        'isBase64Encoded': False
    }
