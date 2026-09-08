import os
from PIL import Image

def crop_assets():
    os.makedirs("assets", exist_ok=True)
    
    # 1. Hero student from study 1.jpeg
    if os.path.exists("study 1.jpeg"):
        im1 = Image.open("study 1.jpeg")
        w, h = im1.size
        # Student character & bot
        student_crop = im1.crop((int(w * 0.42), int(h * 0.05), int(w * 0.99), int(h * 0.99)))
        student_crop.save("assets/hero_student.png")
        
        # Robot avatar
        robot_crop = im1.crop((int(w * 0.75), int(h * 0.05), int(w * 0.96), int(h * 0.24)))
        robot_crop.save("assets/robot_avatar.png")

    # 2. Book stack & Trophy from study 2.jpeg
    if os.path.exists("study 2.jpeg"):
        im2 = Image.open("study 2.jpeg")
        w, h = im2.size
        # Book stack with grad cap (sidebar)
        book_stack = im2.crop((int(w * 0.03), int(h * 0.63), int(w * 0.18), int(h * 0.76)))
        book_stack.save("assets/book_stack.png")
        
        # Trophy
        trophy = im2.crop((int(w * 0.26), int(h * 0.86), int(w * 0.35), int(h * 0.96)))
        trophy.save("assets/trophy.png")
        
        # Robot mascot waving
        robot_wave = im2.crop((int(w * 0.77), int(h * 0.86), int(w * 0.92), int(h * 0.97)))
        robot_wave.save("assets/robot_wave.png")

    # 3. Photosynthesis diagram from study 3.jpeg
    if os.path.exists("study 3.jpeg"):
        im3 = Image.open("study 3.jpeg")
        w, h = im3.size
        # Diagram box
        diagram = im3.crop((int(w * 0.36), int(h * 0.38), int(w * 0.93), int(h * 0.61)))
        diagram.save("assets/photosynthesis_diagram.png")
        
        # AI Bot Head Avatar
        bot_head = im3.crop((int(w * 0.23), int(h * 0.23), int(w * 0.31), int(h * 0.31)))
        bot_head.save("assets/bot_head.png")

    print("Assets cropped successfully!")

if __name__ == "__main__":
    crop_assets()
