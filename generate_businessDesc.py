import pandas as pd

# Load your extracted NIC reference data
df = pd.read_csv("nic_reference.csv")

# Function to generate 3 user-style business descriptions
def generate_descriptions(nic_code, nic_desc):
    nic_desc_lower = nic_desc.lower()
    descriptions = []

    if "restaurant" in nic_desc_lower or "food" in nic_desc_lower:
        descriptions = [
            "We run a local restaurant serving homemade meals.",
            "I own a food truck that sells snacks and lunch boxes.",
            "We provide tiffin and catering services in the city."
        ]
    elif "paint" in nic_desc_lower or "varnish" in nic_desc_lower:
        descriptions = [
            "Our company produces emulsion paints for buildings.",
            "We manufacture oil-based paints for industrial use.",
            "A small factory making varnishes and wall coatings."
        ]
    elif "school" in nic_desc_lower or "education" in nic_desc_lower:
        descriptions = [
            "We operate a private primary school for children.",
            "An academy offering tuition and entrance exam coaching.",
            "Our institute provides online education for students."
        ]
    elif "agriculture" in nic_desc_lower or "crop" in nic_desc_lower or "farming" in nic_desc_lower:
        descriptions = [
            "Our farm cultivates rice and wheat using natural methods.",
            "We grow seasonal vegetables and sell them to local markets.",
            "A family-run land where cereals and pulses are harvested."
        ]
    else:
        # Generic fallback
        descriptions = [
            f"Our business specializes in {nic_desc.lower()}.",
            f"We provide services related to {nic_desc.lower()}.",
            f"We are engaged in {nic_desc.lower()} in our region."
        ]

    # Return 3 entries per NIC
    return [(desc, nic_code, nic_desc) for desc in descriptions]

# Build the full dataset
semantic_rows = []

for _, row in df.iterrows():
    nic_code = row["nic_code"]
    nic_desc = row["nic_description"]
    semantic_rows.extend(generate_descriptions(nic_code, nic_desc))

# Save to DataFrame
semantic_df = pd.DataFrame(semantic_rows, columns=["business_description", "nic_code", "nic_description"])
semantic_df.to_csv("semantic_nic_dataset.csv", index=False)

print(f"✅ Done! Generated {len(semantic_df)} rows in 'semantic_nic_dataset.csv'")