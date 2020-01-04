V=1
while [ 1 ]
do
    if [ "${V}" = "1" ]; then
       V=0
    else
       V=1
    fi
    echo ${V}
    gpio write 7 ${V}
    sleep 0.5
done
