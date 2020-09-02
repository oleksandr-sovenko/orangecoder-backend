cmd_Release/core.node := ln -f "Release/obj.target/core.node" "Release/core.node" 2>/dev/null || (rm -rf "Release/core.node" && cp -af "Release/obj.target/core.node" "Release/core.node")
