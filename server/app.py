import yt_dlp as yt
from flask import Flask, request, jsonify, send_file
import subprocess as sp
from waitress import serve

app = Flask(__name__)

@app.route("/api/convert")
def convert_video_to_mp3_clip():
    start = float(request.args.get("start"))
    end = float(request.args.get("end"))
    videoId = request.args.get("id")
    url = "https://www.youtube.com/watch?v=" + videoId

    yt_opts = {
        'verbose': True,
        'format': 'bestaudio',
        'outtmpl': '%(title)s.mp3',
        'extract_audio': True,
        'download_ranges': lambda info_dict, yt_instance: [
            {'start_time': start, 'end_time': end},
        ],
        'force_keyframes_at_cuts': True,
    }
    process = sp.Popen([
        'yt-dlp',
        '--format', 'bestaudio',
        '--extract-audio',
        '--download-sections', f"*{start}-{end}",
        '--cookies', 'cookies.txt'
        '-o', '-',
        url
    ], stdout=sp.PIPE)
    file = process.stdout.read()
    process.kill()
    return file
    # with yt.YoutubeDL(yt_opts) as ydl:
    #     video = ydl.download("https://www.youtube.com/watch?v=" + videoId, download=True)
    #     # filename = f"{id}_{start}_{end}.mp3"
        
    #     return send_file(video, as_attachment=True, download_name=yt_opts['outtmpl']) 

if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=3000)
    # app.run(debug=True, port=3000)