from translate import Translator

def translate_to_arabic(text):
    """
    Translates the given text from English to Arabic.

    Args:
        text (str): The English text to translate.

    Returns:
        str: The translated Arabic text.
    """
    translator = Translator(to_lang="ar")
    try:
        return translator.translate(text)
    except Exception as e:
        return f"Error occurred during translation: {e}"

# Example usage

