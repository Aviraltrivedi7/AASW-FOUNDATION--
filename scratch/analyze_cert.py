import sys
import subprocess

def install_deps():
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pytesseract', 'Pillow'])

install_deps()

try:
    import pytesseract
    from PIL import Image
    # specify tesseract cmd if needed, but on Windows it might not be in PATH
    # we'll see if it works
    pt = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    import os
    if os.path.exists(pt):
        pytesseract.pytesseract.tesseract_cmd = pt
        
    img = Image.open(r'c:\Users\trive\Downloads\AASW-Foundation-Website\aasw-pro\images\certificate-template.jpg')
    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
    width, height = img.size
    print(f'Image size: {width}x{height}')
    
    for i in range(len(data['text'])):
        text = data['text'][i].strip()
        if text:
            print(f"{text} at x={data['left'][i]}, y={data['top'][i]}, w={data['width'][i]}, h={data['height'][i]}")
except Exception as e:
    print('Error:', e)
