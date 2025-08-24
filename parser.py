import fitz  # PyMuPDF
import re
import pandas as pd

# Load the NIC PDF
pdf_path = "nic.pdf"
doc = fitz.open(pdf_path)
text_data = ""

# Extract only pages 36 to 137 (page indexes: 35 to 136)
for page_num in range(35, 137):
    page = doc.load_page(page_num)
    text_data += page.get_text()

doc.close()

# Extract NIC Code + Description using regex
matches = re.findall(r"(\d{5})\s+([^\n]+)", text_data)

df = pd.DataFrame(matches, columns=["nic_code", "nic_description"])
df['nic_description'] = df['nic_description'].str.strip()
df.drop_duplicates(inplace=True)

df.to_csv("data/nic_cleaned_final.csv", index=False)
print(f"✅ Extracted {len(df)} NIC codes to nic_reference.csv")