#
# ===========================================================================
# pet_item_icons.py - original procedural degree-specific pet equipment icons
#
# Text recipe is the editable source; no binary source atlas is required.
# ===========================================================================
#
import base64
import io
import json

from PIL import Image, ImageDraw



#
# ================
# export_icons
# ================
#
def export_icons():
	icons = []
	for slot in ("collar", "harness", "charm"):
		for degree in range(1, 10):
			image = Image.new("RGBA", (128, 128), (15, 20, 27, 255))
			d = ImageDraw.Draw(image)
			metal = (125 + degree * 12, 99 + degree * 10, 55 + degree * 9)
			gem = (35 + degree * 7, 120 + degree * 8, 135 + degree * 10)
			if slot == "collar":
				d.ellipse((19, 29, 109, 101), fill=(55, 37, 25), outline=metal, width=9)
				d.ellipse((33, 37, 95, 81), fill=(15, 20, 27), outline=(97, 67, 38), width=4)
				d.polygon([(64, 64), (79, 83), (64, 105), (49, 83)], fill=metal)
				d.ellipse((56, 76, 72, 92), fill=gem)
			elif slot == "harness":
				d.polygon([(31, 22), (50, 18), (101, 101), (81, 110)], fill=(85, 48, 27), outline=metal, width=4)
				d.polygon([(78, 18), (99, 23), (47, 110), (27, 101)], fill=(85, 48, 27), outline=metal, width=4)
				d.rounded_rectangle((44, 49, 84, 85), radius=5, fill=metal)
				d.rectangle((54, 59, 74, 75), fill=gem)
			else:
				d.arc((35, 13, 93, 73), 190, 350, fill=metal, width=5)
				d.polygon([(64, 36), (97, 72), (64, 111), (31, 72)], fill=metal)
				d.polygon([(64, 47), (85, 72), (64, 98), (43, 72)], fill=gem)
			for ornament in range(degree):
				x = 30 + ornament * 8
				d.ellipse((x, 105, x + 4, 109), fill=metal)
			icon = image.resize((32, 32), Image.Resampling.LANCZOS)
			ImageDraw.Draw(icon).rectangle((0, 0, 31, 31), outline=(51, 61, 77, 255))
			output = io.BytesIO()
			icon.save(output, format="PNG")
			icons.append({"slot": slot, "degree": degree, "png": base64.b64encode(output.getvalue()).decode("ascii")})
	return icons


if __name__ == "__main__":
	print(json.dumps(export_icons()))
