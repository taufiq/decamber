from pptx import Presentation
from pptx.shapes.placeholder import SlidePlaceholder
from pptx.util import Inches
from PIL import Image
import pprint
import os

def get_resized_image_width(original_size, height):
    return original_size[0] / original_size[1] * height

def get_size(path_to_image):
    image = Image.open(path_to_image)
    dpi = image.info.get('dpi')

    return (image.width, image.height)

def generate_presentation(incident_no: str, summary: str, session_id) -> Presentation:
    presentation: Presentation = Presentation()
    evidences_path = list(map(lambda evidence: f'./{session_id}/{evidence}', list(
    filter(lambda evidence: evidence.endswith(''), os.listdir(f'./{session_id}')))))

    first_slide = presentation.slides.add_slide(presentation.slide_layouts[0])

    for idx, shape in enumerate(first_slide.placeholders):
        placeholder_format = shape.placeholder_format
        shape: SlidePlaceholder = shape
        shape.placeholder_format
        if shape.has_text_frame:
            if idx == 0:  # Center Title
                shape.text_frame.clear()
                shape.text_frame.text = "Decam report"
            if idx == 1:  # Subtitle
                shape.text_frame.clear()
                shape.text_frame.text = f"Incident Number {incident_no}"

    for evidence in evidences_path:
        slide = presentation.slides.add_slide(presentation.slide_layouts[1])
        slide.placeholders[0].text_frame.text = incident_no
        image_height = slide.placeholders[1].height
        image_width = get_resized_image_width(get_size(evidence), image_height)
        top = slide.placeholders[1].top
        left = presentation.slide_width / 2 - image_width / 2
        slide.shapes.add_picture(evidence, left, top, height=image_height)

    stop_message_slide = presentation.slides.add_slide(presentation.slide_layouts[1])

    for idx, shape in enumerate(stop_message_slide.placeholders):
        placeholder_format = shape.placeholder_format
        print(type(placeholder_format.type),
            placeholder_format.type._member_name, placeholder_format.idx)
        shape: SlidePlaceholder = shape
        shape.placeholder_format
        if shape.has_text_frame:
            if idx == 0:  # 'Title'
                shape.text_frame.clear()
                shape.text_frame.text = "Stop Message"
            if idx == 1:  # Subtitle
                shape.text_frame.clear()
                shape.text_frame.text = summary


    
    return presentation