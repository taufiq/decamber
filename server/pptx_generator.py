from pptx import Presentation
from pptx.shapes.placeholder import SlidePlaceholder
from pptx.util import Inches
import pprint
import os

evidences_path = list(map(lambda evidence: f'./buffer_evidences/{evidence}', list(
    filter(lambda evidence: evidence.endswith(''), os.listdir('./buffer_evidences')))))

def generate_presentation(incident_no: str, summary: str) -> Presentation:
    presentation: Presentation = Presentation()

    first_slide = presentation.slides.add_slide(presentation.slide_layouts[0])

    for idx, shape in enumerate(first_slide.placeholders):
        placeholder_format = shape.placeholder_format
        shape: SlidePlaceholder = shape
        shape.placeholder_format
        if shape.has_text_frame:
            if idx == 0:  # Center Title
                shape.text_frame.clear()
                shape.text_frame.text = "Decam report on 25 Oct 2020"
            if idx == 1:  # Subtitle
                shape.text_frame.clear()
                shape.text_frame.text = f"Incident Number {incident_no}"

    second_slide = presentation.slides.add_slide(presentation.slide_layouts[1])

    for idx, shape in enumerate(second_slide.placeholders):
        placeholder_format = shape.placeholder_format
        print(type(placeholder_format.type),
            placeholder_format.type._member_name, placeholder_format.idx)
        shape: SlidePlaceholder = shape
        shape.placeholder_format
        if shape.has_text_frame:
            if idx == 0:  # 'Title'
                shape.text_frame.clear()
                shape.text_frame.text = "Summary"
            if idx == 1:  # Subtitle
                shape.text_frame.clear()
                shape.text_frame.text = summary

    for evidence in evidences_path:
        slide = presentation.slides.add_slide(presentation.slide_layouts[5])
        height = Inches(5.5)
        left = top = Inches(1)
        slide.shapes.add_picture(evidence, left, top, height=height)
    
    return presentation