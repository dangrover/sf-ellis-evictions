# Parse the stats out of the rent board monthly stat PDFs
import os
from pdfminer.pdfparser import PDFParser, PDFDocument
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.pdfdevice import PDFDevice
from pdfminer.layout import LAParams, LTTextBox, LTTextLine, LTFigure
from pdfminer.converter import PDFPageAggregator
from util import PDF_OUTPUT_DIR

all_pdf_paths = filter(lambda p: p.endswith('.pdf'), map(lambda p: os.path.join(PDF_OUTPUT_DIR, p), os.listdir(PDF_OUTPUT_DIR)))

# Taken from: http://denis.papathanasiou.org/2010/08/04/extracting-text-images-from-pdf-files/
def parse_lt_objs (lt_objs, page_number, text=[]):
    text_content = [] 

    for lt_obj in lt_objs:
        if isinstance(lt_obj, LTTextBox) or isinstance(lt_obj, LTTextLine):
            # text
            text_content.append(lt_obj.get_text())
        elif isinstance(lt_obj, LTFigure):
            # LTFigure objects are containers for other LT* objects, so recurse through the children
            text_content.append(parse_lt_objs(lt_obj.objs, page_number, text_content))

    return '\n'.join(text_content)


for pdf_path in all_pdf_paths:
	print pdf_path
	# This setup copied from this tutorial:
	# http://www.unixuser.org/~euske/python/pdfminer/programming.html

	fp = open(pdf_path, 'rb')
	parser = PDFParser(fp)
	doc = PDFDocument()
	parser.set_document(doc)
	doc.set_parser(parser)
	doc.initialize('')

	if not doc.is_extractable:
		raise Exception("Not extractable")

	rsrcmgr = PDFResourceManager()
	laparams = LAParams()
	device = PDFPageAggregator(rsrcmgr, laparams=laparams)
	interpreter = PDFPageInterpreter(rsrcmgr, device)

	for i, page in enumerate(doc.get_pages()):
	    interpreter.process_page(page)
	    layout = device.get_result()
	    print "layout = %s" % dir(layout)
	    text = parse_lt_objs(layout._objs, i + 1)
	    print "layout = %s" % text