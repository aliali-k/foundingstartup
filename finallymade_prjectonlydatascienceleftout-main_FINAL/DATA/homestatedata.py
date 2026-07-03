import pandas as pd

# Using a clean Python List data structure for perfect data handling
josaa_exact_data = {
    'State_Code_Of_Eligibility': [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
        'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 
        'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 
        'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
        'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 
        'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
        'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 
        'Daman and Diu', 'Dadra and Nagar Haveli'
    ],
    'Eligible_Colleges': [
        ['National Institute of Technology Andhra Pradesh'],
        ['National Institute of Technology Arunachal Pradesh', 'North Eastern Regional Institute of Science and Technology, Nirjuli-791109 (Itanagar),Arunachal Pradesh', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Silchar', 'Assam University, Silchar', 'School of Engineering, Tezpur University, Napaam, Tezpur', 'Central institute of Technology Kokrajar, Assam', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Patna', 'Birla Institute of Technology, Patna Off-Campus', 'National Institute of Electronics and Information Technology, Patna (Bihar)'],
        ['National Institute of Technology Delhi', 'Punjab Engineering College, Chandigarh'],
        ['National Institute of Technology Raipur', 'Chhattisgarh Swami Vivekanada Technical University, Bhilai (CSVTU Bhilai)', 'International Institute of Information Technology, Naya Raipur', 'School of Studies of Engineering and Technology, Guru Ghasidas Vishwavidyalaya, Bilaspur'],
        ['National Institute of Technology Delhi', 'Jawaharlal Nehru University, Delhi', 'School of Planning & Architecture, New Delhi'],
        ['National Institute of Technology Goa'],
        ['Sardar Vallabhbhai National Institute of Technology, Surat', 'Institute of Infrastructure, Technology, Research and Management-Ahmedabad', 'Gati Shakti Vishwavidyalaya, Vadodara'],
        ['National Institute of Technology Kurukshetra', 'National Institute of Food Technology Entrepreneurship and Management, Kundli', 'Central University of Haryana'],
        ['National Institute of Technology Hamirpur'],
        ['National Institute of Technology Srinagar', 'Shri Mata Vaishno Devi University, Katra, Jammu & Kashmir', 'Central University of Jammu', 'Islamic University of Science and Technology Kashmir'],
        ['National Institute of Technology Jamshedpur', 'Birla Institute of Technology, Mesra, Ranchi', 'Birla Institute of Technology, Deoghar Off-Campus', 'National Institute of Advanced Manufacturing Technology, Ranchi', 'CU Jharkhand'],
        ['National Institute of Technology Karnataka, Surathkal'],
        ['National Institute of Technology Calicut'],
        ['National Institute of Technology Srinagar'],
        ['National Institute of Technology Goa', 'National Institute of Technology Calicut'],
        ['Maulana Azad National Institute of Technology, Bhopal', 'School of Planning & Architecture, Bhopal', 'Institute of Engineering and Technology, Dr. H. S. Gour University. Sagar (A Central University)', 'Shri G. S. Institute of Technology and Science Indore'],
        ['Visvesvaraya National Institute of Technology, Nagpur', 'National Institute of Electronics and Information Technology, Aurangabad (Maharashtra)'],
        ['National Institute of Technology Manipur', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Meghalaya', 'North-Eastern Hill University, Shillong', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Mizoram', 'Mizoram University, Aizawl', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Nagaland', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Rourkela', 'Institute of Chemical Technology, Mumbai: Indian Oil Odisha Campus, Bhubaneswar', 'International Institute of Information Technology, Bhubaneswar'],
        ['National Institute of Technology Puducherry', 'Puducherry Technological University, Puducherry'],
        ['Dr. B R Ambedkar National Institute of Technology, Jalandhar', 'Sant Longowal Institute of Engineering and Technology', 'National Institute of Electronics and Information Technology, Ropar (Punjab)'],
        ['Malaviya National Institute of Technology Jaipur', 'Central University of Rajasthan, Rajasthan', 'National Institute of Electronics and Information Technology, Ajmer (Rajasthan)'],
        ['National Institute of Technology Sikkim', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Tiruchirappalli', 'National Institute of Food Technology Entrepreneurship and Management, Thanjavur', 'Indian Institute of Handloom Technology, Salem', 'School of Planning & Architecture: Vijayawada'],
        ['National Institute of Technology Warangal', 'University of Hyderabad'],
        ['National Institute of Technology Agartala', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['Motilal Nehru National Institute of Technology, Allahabad', 'Indian Institute of Carpet Technology, Bhadohi', 'J.K. Institute of Applied Physics & Technology, Department of Electronics & Communication, University of Allahabad- Allahabad', 'Indian Institute of Handloom Technology(IIHT), Varanasi', 'National Institute of Electronics and Information Technology, Gorakhpur (UP)', 'Rajiv Gandhi National Aviation University, Fursatganj, Amethi (UP)'],
        ['National Institute of Technology Uttarakhand', 'Gurukula Kangri Vishwavidyalaya, Haridwar'],
        ['National Institute of Technology Durgapur', 'Indian Institute of Engineering Science and Technology, Shibpur', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
        ['National Institute of Technology Puducherry', 'National Institute of Technology Durgapur'],
        ['National Institute of Technology Goa', 'Sardar Vallabhbhai National Institute of Technology, Surat'],
        ['National Institute of Technology Goa', 'Sardar Vallabhbhai National Institute of Technology, Surat']
    ]
}

# 1. Create DataFrame
df = pd.DataFrame(josaa_exact_data)

# 2. Since it's already a list, you can drop .str.split() completely! Just explode it directly:
df_exploded = df.explode('Eligible_Colleges')

# 3. Clean up any accidental whitespace (just in case)
df_exploded['Eligible_Colleges'] = df_exploded['Eligible_Colleges'].str.strip()

# Ready for tomorrow's scraping matching!


print(df_exploded.head(100))
























































# State → Home State Colleges mapping
# WHY: user sirf state enter karega
#      yeh data college_data.py mein use hoga
#      automatically HS quota detect hoga
# josaa_exact_data = {
#     'State_Code_Of_Eligibility': [
#         'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
#         'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
#         'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh',
#         'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
#         'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
#         'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
#         'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
#         'Daman and Diu', 'Dadra and Nagar Haveli'
#     ],
#     'Eligible_Colleges': [
#         ['National Institute of Technology Andhra Pradesh'],
#         ['National Institute of Technology Arunachal Pradesh', 'North Eastern Regional Institute of Science and Technology, Nirjuli-791109 (Itanagar),Arunachal Pradesh', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Silchar', 'Assam University, Silchar', 'School of Engineering, Tezpur University, Napaam, Tezpur', 'Central institute of Technology Kokrajar, Assam', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Patna', 'Birla Institute of Technology, Patna Off-Campus', 'National Institute of Electronics and Information Technology, Patna (Bihar)'],
#         ['National Institute of Technology Delhi', 'Punjab Engineering College, Chandigarh'],
#         ['National Institute of Technology Raipur', 'Chhattisgarh Swami Vivekanada Technical University, Bhilai (CSVTU Bhilai)', 'International Institute of Information Technology, Naya Raipur', 'School of Studies of Engineering and Technology, Guru Ghasidas Vishwavidyalaya, Bilaspur'],
#         ['National Institute of Technology Delhi', 'Jawaharlal Nehru University, Delhi', 'School of Planning & Architecture, New Delhi'],
#         ['National Institute of Technology Goa'],
#         ['Sardar Vallabhbhai National Institute of Technology, Surat', 'Institute of Infrastructure, Technology, Research and Management-Ahmedabad', 'Gati Shakti Vishwavidyalaya, Vadodara'],
#         ['National Institute of Technology Kurukshetra', 'National Institute of Food Technology Entrepreneurship and Management, Kundli', 'Central University of Haryana'],
#         ['National Institute of Technology Hamirpur'],
#         ['National Institute of Technology Srinagar', 'Shri Mata Vaishno Devi University, Katra, Jammu & Kashmir', 'Central University of Jammu', 'Islamic University of Science and Technology Kashmir'],
#         ['National Institute of Technology Jamshedpur', 'Birla Institute of Technology, Mesra, Ranchi', 'Birla Institute of Technology, Deoghar Off-Campus', 'National Institute of Advanced Manufacturing Technology, Ranchi', 'CU Jharkhand'],
#         ['National Institute of Technology Karnataka, Surathkal'],
#         ['National Institute of Technology Calicut'],
#         ['National Institute of Technology Srinagar'],
#         ['National Institute of Technology Goa', 'National Institute of Technology Calicut'],
#         ['Maulana Azad National Institute of Technology, Bhopal', 'School of Planning & Architecture, Bhopal', 'Institute of Engineering and Technology, Dr. H. S. Gour University. Sagar (A Central University)', 'Shri G. S. Institute of Technology and Science Indore'],
#         ['Visvesvaraya National Institute of Technology, Nagpur', 'National Institute of Electronics and Information Technology, Aurangabad (Maharashtra)'],
#         ['National Institute of Technology Manipur', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Meghalaya', 'North-Eastern Hill University, Shillong', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Mizoram', 'Mizoram University, Aizawl', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Nagaland', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Rourkela', 'Institute of Chemical Technology, Mumbai: Indian Oil Odisha Campus, Bhubaneswar', 'International Institute of Information Technology, Bhubaneswar'],
#         ['National Institute of Technology Puducherry', 'Puducherry Technological University, Puducherry'],
#         ['Dr. B R Ambedkar National Institute of Technology, Jalandhar', 'Sant Longowal Institute of Engineering and Technology', 'National Institute of Electronics and Information Technology, Ropar (Punjab)'],
#         ['Malaviya National Institute of Technology Jaipur', 'Central University of Rajasthan, Rajasthan', 'National Institute of Electronics and Information Technology, Ajmer (Rajasthan)'],
#         ['National Institute of Technology Sikkim', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Tiruchirappalli', 'National Institute of Food Technology Entrepreneurship and Management, Thanjavur', 'Indian Institute of Handloom Technology, Salem', 'School of Planning & Architecture: Vijayawada'],
#         ['National Institute of Technology Warangal', 'University of Hyderabad'],
#         ['National Institute of Technology Agartala', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['Motilal Nehru National Institute of Technology, Allahabad', 'Indian Institute of Carpet Technology, Bhadohi', 'J.K. Institute of Applied Physics & Technology, Department of Electronics & Communication, University of Allahabad- Allahabad', 'Indian Institute of Handloom Technology(IIHT), Varanasi', 'National Institute of Electronics and Information Technology, Gorakhpur (UP)', 'Rajiv Gandhi National Aviation University, Fursatganj, Amethi (UP)'],
#         ['National Institute of Technology Uttarakhand', 'Gurukula Kangri Vishwavidyalaya, Haridwar'],
#         ['National Institute of Technology Durgapur', 'Indian Institute of Engineering Science and Technology, Shibpur', 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal'],
#         ['National Institute of Technology Puducherry', 'National Institute of Technology Durgapur'],
#         ['National Institute of Technology Goa', 'Sardar Vallabhbhai National Institute of Technology, Surat'],
#         ['National Institute of Technology Goa', 'Sardar Vallabhbhai National Institute of Technology, Surat']
#     ]
# }

# PANDAS SHOWCASE: dictionary → DataFrame → explode
# WHY explode: ek state ke multiple colleges hain
# explode → har college ek alag row mein aa jaata hai
# college_data.py mein str.contains() se match hoga

# df_state_colleges = pd.DataFrame(josaa_exact_data).explode('Eligible_Colleges')
# df_state_colleges['Eligible_Colleges'] = df_state_colleges['Eligible_Colleges'].str.strip()
