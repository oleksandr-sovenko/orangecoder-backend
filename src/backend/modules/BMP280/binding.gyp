{
  "targets": [
    {
        "target_name": "BMP280",
        "libraries": [ "-lwiringPi", "-lpthread" ],
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [ "main.cc", "bmp280.cpp" ],
        "include_dirs": [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}
