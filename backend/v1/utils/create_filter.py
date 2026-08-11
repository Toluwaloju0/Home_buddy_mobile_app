# create a mini function to create the filter value for min and max price
def get_price_value(min_price: int, max_price: int):
    """ a mini function to get the value for the price to add to the filter
    Args:
        min_price: the minimum price
        max_price: the max price
    """

    min_price = min_price - 10000 if min_price - 10000 > 0 else 0
    max_price = max_price + 10000

    return {"$gte": min_price, "$lte": max_price}

# create a mini function to create the filter value for min and max sizes
def get_size_value(min_size: int, max_size: int):
        """ a mini function to get the value for the sizee to add to the filter
        Args:
            min_size: the minimum size
            max_size: the max size
        """

        min_size = min_size - 100 if min_size - 100 > 0 else 0
        max_size = max_size + 100

        return {"$gte": min_size, "$lte": max_size}