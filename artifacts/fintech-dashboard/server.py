import os
from flask import Flask, send_from_directory, redirect

app = Flask(__name__)
ROOT = os.path.dirname(os.path.abspath(__file__))

PAGES = ['login', 'signup', 'dashboard', 'expenses', 'savings', 'advisory', 'profile']

@app.route('/')
def index():
    return redirect('/login')

@app.route('/favicon.ico')
def favicon():
    return '', 204

for _page in PAGES:
    def _make(p):
        def _handler():
            return send_from_directory(ROOT, f'{p}.html')
        _handler.__name__ = p
        return _handler
    app.add_url_rule(f'/{_page}', _page, _make(_page))

@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory(os.path.join(ROOT, 'css'), filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    return send_from_directory(os.path.join(ROOT, 'js'), filename)

@app.route('/images/<path:filename>')
def image_files(filename):
    return send_from_directory(os.path.join(ROOT, 'public', 'images'), filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
