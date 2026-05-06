"""
lib/village_coords.py — Approximate village center coordinates for Tamil Nadu.
Used to drop map pins. These are approximate lat/lon for the village/town center.
NEVER use these as exact parcel GPS coordinates.
"""

VILLAGE_COORDS: dict[str, dict] = {
    # Chennai
    "vepery":              {"lat": 13.0827, "lon": 80.2707},
    "egmore":              {"lat": 13.0732, "lon": 80.2609},
    "anna nagar":          {"lat": 13.0850, "lon": 80.2101},
    "t. nagar":            {"lat": 13.0418, "lon": 80.2341},
    "adyar":               {"lat": 13.0012, "lon": 80.2565},
    "tambaram":            {"lat": 12.9249, "lon": 80.1000},
    "guindy":              {"lat": 13.0067, "lon": 80.2206},
    "perambur":            {"lat": 13.1185, "lon": 80.2445},
    "mylapore":            {"lat": 13.0336, "lon": 80.2674},
    "velachery":           {"lat": 12.9815, "lon": 80.2209},

    # Coimbatore
    "saravanampatti":      {"lat": 11.0737, "lon": 77.0073},
    "peelamedu":           {"lat": 11.0200, "lon": 77.0280},
    "rs puram":            {"lat": 11.0070, "lon": 76.9579},
    "ganapathy":           {"lat": 11.0412, "lon": 77.0015},
    "coimbatore":          {"lat": 11.0168, "lon": 76.9558},

    # Madurai
    "koodal nagar":        {"lat": 9.9252, "lon": 78.1198},
    "anna nagar madurai":  {"lat": 9.9384, "lon": 78.1254},
    "palanganatham":       {"lat": 9.9000, "lon": 78.1400},
    "madurai":             {"lat": 9.9252, "lon": 78.1198},

    # Tiruchirappalli
    "srirangam":           {"lat": 10.8619, "lon": 78.6900},
    "ariyamangalam":       {"lat": 10.8200, "lon": 78.7700},
    "tiruchirappalli":     {"lat": 10.7905, "lon": 78.7047},
    "trichy":              {"lat": 10.7905, "lon": 78.7047},

    # Salem
    "shevapet":            {"lat": 11.6644, "lon": 78.1460},
    "suramangalam":        {"lat": 11.6643, "lon": 78.1842},
    "fairlands":           {"lat": 11.6720, "lon": 78.1460},
    "salem":               {"lat": 11.6643, "lon": 78.1460},

    # Erode
    "erode west":          {"lat": 11.3417, "lon": 77.7172},
    "erode":               {"lat": 11.3417, "lon": 77.7172},
    "bhavani":             {"lat": 11.4474, "lon": 77.6797},
    "gobichettipalayam":   {"lat": 11.4544, "lon": 77.4368},

    # Vellore
    "vellore fort":        {"lat": 12.9202, "lon": 79.1333},
    "vellore":             {"lat": 12.9202, "lon": 79.1333},
    "katpadi":             {"lat": 12.9707, "lon": 79.1425},

    # Tirunelveli
    "melapalayam":         {"lat": 8.7139, "lon": 77.7567},
    "palayamkottai":       {"lat": 8.7197, "lon": 77.7567},
    "tirunelveli":         {"lat": 8.7272, "lon": 77.6958},

    # Thanjavur
    "thanjavur west":      {"lat": 10.7870, "lon": 79.1378},
    "thanjavur":           {"lat": 10.7870, "lon": 79.1378},
    "papanasam":           {"lat": 10.9289, "lon": 79.2722},
    "kumbakonam":          {"lat": 10.9617, "lon": 79.3788},

    # Namakkal
    "kamalapuram":         {"lat": 11.2188, "lon": 78.1669},
    "namakkal":            {"lat": 11.2188, "lon": 78.1669},
    "tiruchengode":        {"lat": 11.3830, "lon": 77.8956},
    "rasipuram":           {"lat": 11.4622, "lon": 78.1713},

    # Cuddalore
    "chidambaram town":    {"lat": 11.3994, "lon": 79.6947},
    "chidambaram":         {"lat": 11.3994, "lon": 79.6947},
    "cuddalore":           {"lat": 11.7447, "lon": 79.7689},
    "panruti":             {"lat": 11.7667, "lon": 79.5614},

    # Kanyakumari
    "nagercoil town":      {"lat": 8.1833, "lon": 77.4119},
    "nagercoil":           {"lat": 8.1833, "lon": 77.4119},
    "thuckalay":           {"lat": 8.2367, "lon": 77.2506},
    "colachel":            {"lat": 8.1736, "lon": 77.2639},

    # Tiruppur
    "tiruppur":            {"lat": 11.1085, "lon": 77.3411},
    "palladam":            {"lat": 11.0036, "lon": 77.2842},
    "avinashi":            {"lat": 11.1945, "lon": 77.2701},

    # Dindigul
    "dindigul":            {"lat": 10.3624, "lon": 77.9695},
    "palani":              {"lat": 10.4483, "lon": 77.5247},
    "kodaikanal":          {"lat": 10.2381, "lon": 77.4892},

    # Villupuram
    "villupuram":          {"lat": 11.9401, "lon": 79.4928},
    "tindivanam":          {"lat": 12.2345, "lon": 79.6504},
    "gingee":              {"lat": 12.2524, "lon": 79.4164},

    # Pudukottai
    "pudukottai":          {"lat": 10.3816, "lon": 78.8206},
    "aranthangi":          {"lat": 10.1726, "lon": 79.0831},

    # Sivaganga
    "sivaganga":           {"lat": 9.8450, "lon": 78.4800},
    "karaikudi":           {"lat": 10.0750, "lon": 78.7710},
    "devakottai":          {"lat": 9.9500, "lon": 78.8167},

    # Virudhunagar
    "virudhunagar":        {"lat": 9.5851, "lon": 77.9624},
    "rajapalayam":         {"lat": 9.4525, "lon": 77.5579},
    "sivakasi":            {"lat": 9.4514, "lon": 77.7980},

    # Tenkasi
    "tenkasi":             {"lat": 8.9559, "lon": 77.3152},
    "courtallam":          {"lat": 8.9300, "lon": 77.2667},

    # Krishnagiri
    "krishnagiri":         {"lat": 12.5186, "lon": 78.2137},
    "hosur":               {"lat": 12.7409, "lon": 77.8253},
    "dharmapuri":          {"lat": 12.1278, "lon": 78.1583},

    # Tiruvannamalai
    "tiruvannamalai":      {"lat": 12.2253, "lon": 79.0747},
    "polur":               {"lat": 12.5231, "lon": 79.1461},
    "vandavasi":           {"lat": 12.5031, "lon": 79.6177},

    # Ariyalur
    "ariyalur":            {"lat": 11.1412, "lon": 79.0765},
    "perambalur":          {"lat": 11.2337, "lon": 78.8816},

    # Nagapattinam
    "nagapattinam":        {"lat": 10.7672, "lon": 79.8449},
    "vedaranyam":          {"lat": 10.3733, "lon": 79.8524},
    "sirkazhi":            {"lat": 11.2334, "lon": 79.7458},

    # Tiruvarur
    "tiruvarur":           {"lat": 10.7729, "lon": 79.6339},
    "mannargudi":          {"lat": 10.6641, "lon": 79.4520},

    # Mayiladuthurai
    "mayiladuthurai":      {"lat": 11.1016, "lon": 79.6506},
    "sirkazhi mayiladuthurai": {"lat": 11.2334, "lon": 79.7458},

    # Kallakurichi
    "kallakurichi":        {"lat": 11.7381, "lon": 78.9611},

    # Ranipet
    "ranipet":             {"lat": 12.9229, "lon": 79.3319},
    "arcot":               {"lat": 12.9057, "lon": 79.3179},
    "walajah":             {"lat": 12.9200, "lon": 79.3800},

    # Tirupattur
    "tirupattur":          {"lat": 12.4956, "lon": 78.5723},
    "ambur":               {"lat": 12.7949, "lon": 78.7183},

    # Chengalpattu
    "chengalpattu":        {"lat": 12.6920, "lon": 79.9767},
    "mahabalipuram":       {"lat": 12.6208, "lon": 80.1924},
    "tiruporur":           {"lat": 12.7471, "lon": 80.1768},
}
