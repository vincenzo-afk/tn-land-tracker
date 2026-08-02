/**
 * TN Land Tracker — Constants
 * Static lists of Tamil Nadu districts, taluks, and villages.
 */

export const DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

export const TALUKS: Record<string, string[]> = {
  "Chennai": ["Egmore", "Mylapore", "Perambur", "Guindy", "T. Nagar", "Velachery", "Adyar", "Anna Nagar"],
  "Coimbatore": ["Coimbatore North", "Coimbatore South", "Perur", "Madukkarai", "Pollachi", "Mettupalayam", "Sulur"],
  "Madurai": ["Madurai North", "Madurai South", "Madurai East", "Madurai West", "Melur", "Vadipatti", "Usilampatti"],
  "Tiruchirappalli": ["Srirangam", "Trichy East", "Trichy West", "Manachanallur", "Lalgudi", "Musiri", "Thuraiyur"],
  "Salem": ["Salem", "Salem West", "Salem South", "Omalur", "Mettur", "Attur", "Yercaud"],
  "Tirunelveli": ["Palayamkottai", "Tirunelveli", "Ambasamudram", "Radhapuram", "Nanguneri"],
  "Vellore": ["Vellore", "Katpadi", "Gudiyatham", "Pernambut"],
  "Erode": ["Erode", "Perundurai", "Bhavani", "Gobichettipalayam", "Sathyamangalam"],
  "Thanjavur": ["Thanjavur", "Kumbakonam", "Papanasam", "Pattukkottai", "Orathanadu"],
  "Namakkal": ["Namakkal", "Rasipuram", "Tiruchengode", "Paramathi Velur", "Kolli Hills"],
  "Cuddalore": ["Cuddalore", "Chidambaram", "Panruti", "Virudhachalam", "Tittakudi"],
  "Kanyakumari": ["Agastheeswaram", "Thovalai", "Kalkulam", "Vilavancode"],
};

export const VILLAGES: Record<string, string[]> = {
  "Egmore": ["Vepery", "Egmore", "Purasawalkam", "Kilpauk"],
  "Coimbatore North": ["Saravanampatti", "Ganapathy", "Kavundampalayam", "Thudiyalur"],
  "Madurai North": ["Koodal Nagar", "Anna Nagar", "Sellur", "Bibikulam"],
  "Srirangam": ["Srirangam", "Thiruvanaikoil", "Tiruvasi", "Bikshandar Koil"],
  "Salem": ["Shevapet", "Suramangalam", "Fairlands", "Gugai"],
  "Palayamkottai": ["Melapalayam", "Palayamkottai", "Maharajanagar", "Perumalpuram"],
  "Vellore": ["Vellore Fort", "Sathuvachari", "Thorapadi", "Bagayam"],
  "Erode": ["Erode West", "Erode East", "Surampatti", "Kasipalayam"],
  "Thanjavur": ["Thanjavur West", "Thanjavur East", "Medical College Area"],
  "Namakkal": ["Kamalapuram", "Namakkal Town", "Nallipalayam"],
  "Chidambaram": ["Chidambaram Town", "Annamalai Nagar", "Killai"],
  "Agastheeswaram": ["Nagercoil Town", "Kanyakumari", "Suchindram"],
};

export const LAND_STATUS_COLORS: Record<string, string> = {
  "active": "bg-green-100 text-green-800 border-green-200",
  "disputed": "bg-red-100 text-red-800 border-red-200",
  "govt": "bg-blue-100 text-blue-800 border-blue-200",
  "poramboke": "bg-yellow-100 text-yellow-800 border-yellow-200",
};
