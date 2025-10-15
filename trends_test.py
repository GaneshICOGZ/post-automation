from pytrends.request import TrendReq

pytrends = TrendReq(hl='en-US', tz=360)
kw_list = ['tech']
pytrends.build_payload(kw_list, timeframe='now 1-d')
print(pytrends.related_queries())
