from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import psycopg2
import os
import requests
import sys
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow requests from Next.js frontend

# PostgreSQL Database Connection
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
    )

# ✅ API Route: Get AI Tools filtered by event_category and type
@app.route('/api/tools', methods=['GET'])
def get_ai_tools():
    conn = get_db_connection()
    cur = conn.cursor()

    event_category_filter = request.args.get("event_category")
    type_filter = request.args.get("filter", "new")  # Default to 'new'

    if event_category_filter:
        cur.execute(
            """
            SELECT name, short_description, full_description, category, source, source_url,
                   screenshot_url, type, created_at, event_category
            FROM ai_tools 
            WHERE LOWER(event_category) LIKE %s AND type = %s;
            """,
            (f"%{event_category_filter.lower()}%", type_filter)
        )
    else:
        cur.execute(
            """
            SELECT name, short_description, full_description, category, source, source_url,
                   screenshot_url, type, created_at, event_category
            FROM ai_tools 
            WHERE type = %s;
            """,
            (type_filter,)
        )

    tools = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "name": tool[0],
            "short_description": tool[1],
            "full_description": tool[2],
            "category": tool[3],
            "source": tool[4],
            "source_url": tool[5],
            "screenshot_url": f"{request.host_url.rstrip('/')}/static/screenshots/{tool[6].replace('/static/screenshots/', '')}" if tool[6] else "/default-screenshot.png",
            "type": tool[7],
            "created_at": tool[8],
            "event_category": tool[9]
        }
        for tool in tools
    ])

# Serve screenshots
@app.route('/static/screenshots/<path:filename>')
def serve_screenshot(filename):
    return send_from_directory("static/screenshots", filename)

# Fetch ALL Google Trends Data from SerpAPI
def get_all_trending_topics():
    try:
        api_key = os.getenv("SERPAPI_KEY")  # Load SerpAPI key from .env
        params = {
            "engine": "google_trends",
            "trend_type": "daily",
            "geo": "US",
            "api_key": api_key,
        }
        response = requests.get("https://serpapi.com/search", params=params)
        data = response.json()

        print("SerpAPI Full Response:", data)

        if "trending_searches" not in data:
            return ["No trends found"]

        all_trends = [trend["title"] for trend in data["trending_searches"]]
        return all_trends[:5]

    except Exception as e:
        return [f"Error fetching trends: {str(e)}"]

# Route to test Google Trends
@app.route('/api/trends/test', methods=['GET'])
def test_google_trends():
    trends = get_all_trending_topics()
    return jsonify(trends)

# Newsletter Subscription Route
@app.route('/api/subscribe', methods=['POST'])
def subscribe_newsletter():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM newsletter_subscribers WHERE email = %s", (email,))
        existing = cur.fetchone()

        if existing:
            return jsonify({"error": "Email already subscribed"}), 400

        cur.execute(
            "INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (%s, NOW())",
            (email,)
        )
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Successfully subscribed!"}), 200

    except Exception as e:
        print("❌ Database error:", str(e), file=sys.stderr, flush=True)
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

# Root endpoint
@app.route('/')
def home():
    return jsonify({"message": "ToolCurator.ai API is live!"})

if __name__ == '__main__':
    app.run(debug=True, port=5002)