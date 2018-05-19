import sys

filepath = sys.argv[1] 
splitBy  = int(sys.argv[2])

with open(filepath) as fp:  
  line = fp.readline()
  cnt = 1
  outputAcc = []
  while line:
    if cnt %  splitBy == 0:
      print("[{}]".format(','.join(outputAcc)))
      outputAcc = []
    else:
      outputAcc.append("\"{}\"".format(line.rstrip()))
    line = fp.readline()
    cnt += 1