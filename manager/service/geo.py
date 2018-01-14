"""
Blatantly copied from this StackOverflow answer: http://stackoverflow.com/a/15216966/4324211
"""
import math

# earth_radius = 3960.0  # for miles
earth_radius = 6371.0  # for kms
degrees_to_radians = math.pi / 180.0
radians_to_degrees = 180.0 / math.pi

def change_in_latitude(distance):
    "Given a distance north, return the change in latitude."
    return (distance / earth_radius) * radians_to_degrees

def change_in_longitude(latitude, distance):
    "Given a latitude and a distance west, return the change in longitude."
    # Find the radius of a circle around the earth at given latitude.
    r = earth_radius * math.cos(latitude * degrees_to_radians)
    return (distance / r) * radians_to_degrees

def bounding_box(latitude, longitude, distance):
    lat = float(latitude)
    lon = float(longitude)

    "Given a latitude, longitude and a distance, return the bounding box for the distance from the point"
    lat_change = change_in_latitude(distance)
    lat_max = lat + lat_change
    lat_min = lat - lat_change
    lon_change = change_in_longitude(lat, distance)
    lon_max = lon + lon_change
    lon_min = lon - lon_change
    return (lon_max, lon_min, lat_max, lat_min)
