#!/bin/sh

# Run this in the same directory as the benchmark factor annual files downloaded from Ken French:
# http://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html

echo "[" > ff-mkt.json
awk 'NR>1 {printf("\t\{ \"dt\": %s, \"r\": %s \},\n", $1, $2/100)}' < F-F_Benchmark_Factors_Annual.txt >> ff-mkt.json
echo "]" >> ff-mkt.json

echo "[" > ff-smb.json
awk 'NR>1 {printf("\t\{ \"dt\": %s, \"r\": %s \},\n", $1, $3/100)}' < F-F_Benchmark_Factors_Annual.txt >> ff-smb.json
echo "]" >> ff-smb.json

echo "[" > ff-hml.json
awk 'NR>1 {printf("\t\{ \"dt\": %s, \"r\": %s \},\n", $1, $4/100)}' < F-F_Benchmark_Factors_Annual.txt >> ff-hml.json
echo "]" >> ff-hml.json
