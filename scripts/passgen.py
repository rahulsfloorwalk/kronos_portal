import string
import random
for i in range(1,1623):
    a = ''.join(random.SystemRandom().choice(string.ascii_lowercase + string.digits) for _ in range(10))
    print(a)
