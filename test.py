dict_x = {"name":"prakash", "Age":23}
dict_y = {"name":"Joy"}

merged_dict = {**dict_x, **dict_y}
print(merged_dict)

#The reason there is no merge method for dictionaries is because Python dictionaries are unordered.
#If you want to merge two dictionaries, you can use the ** operator to unpack the dictionaries into keyword arguments,
#and then pass them to the dict() constructor.

#The ** operator is used to unpack a dictionary into keyword arguments.

#unordered means that the order of the keys in the dictionary is not important.