
def get_color_code_by_percentage(percentage):
    if percentage is None:
        return 0

    if percentage > 80:
        return 4
    elif percentage > 60:
        return 3
    elif percentage > 40:
        return 2
    elif percentage >= 0:
        return 1
    else:
        return 0

def get_color_code(marks_obtained, max_marks):
    if marks_obtained is None:
        marks_obtained = 0

    if max_marks is not 0:
        percentage = int((marks_obtained * 100) / max_marks)
    else:
        percentage = -1 

    return get_color_code_by_percentage(percentage)


def get_color_hex_from_code(color_code):
    colors = ("#FFFFFF", "#F2DEDE", "#FCF8E3", "#D9EDF7", "#DFF0D8")
    return colors[color_code]
