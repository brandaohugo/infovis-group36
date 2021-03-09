import PyPDF2
import minecart
import os
from PIL import Image


#path_parent = os.path.dirname(os.getcwd())
#os.chdir(path_parent)
dir="/app/data/images/raw_pdf/"
reldir="../app/data/images/raw_pdf"



##########PyPDF2 attempt################

if __name__ == '__main__':
    input1 = PyPDF2.PdfFileReader(open(reldir+"/input.pdf", "rb"))

#    input1 = PyPDF2.PdfFileReader(open(os.getcwd()+dir+"/input.pdf", "rb"))
    page0 = input1.getPage(0)


    pdfWriter = PyPDF2.PdfFileWriter()
    pdfWriter.addPage(page0)
    pdfWriter.removeImages(ignoreByteStringObject=True)
    pdfWriter.


    pdfOutputFile = open('test.pdf', 'wb')
    pdfWriter.write(pdfOutputFile)
    pdfOutputFile.close()
