{
  "targets": [
    {
        "target_name": "core",
        "libraries": [ "-lwiringPi", "-lpthread" ],
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [ "core.cc", "bmp280/bmp280.cpp" ],
        "include_dirs": [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}
