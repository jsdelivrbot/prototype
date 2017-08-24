"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LogType;
(function (LogType) {
    LogType[LogType["LOG"] = 0] = "LOG";
    LogType[LogType["INFO"] = 1] = "INFO";
    LogType[LogType["WARN"] = 2] = "WARN";
    LogType[LogType["ERROR"] = 3] = "ERROR";
})(LogType = exports.LogType || (exports.LogType = {}));
exports.arrayHeaderSize = 8;
var LongModule;
try {
    LongModule = require("long");
    if (typeof LongModule !== "function")
        LongModule = undefined;
}
catch (e) { }
function initializeMemory(memoryInstance, malloc, memset) {
    var memory = memoryInstance;
    var buffer = new Uint8Array(memoryInstance.buffer);
    memory.byte = memory.u8 = {
        get: function get_byte(ptr) {
            return buffer[ptr];
        },
        set: function set_byte(ptr, value) {
            buffer[ptr] = value;
        }
    };
    memory.sbyte = memory.s8 = {
        get: function get_sbyte(ptr) {
            return buffer[ptr] << 24 >> 24;
        },
        set: function set_sbyte(ptr, value) {
            buffer[ptr] = value;
        }
    };
    memory.short = memory.s16 = {
        get: function get_short(ptr) {
            return (buffer[ptr]
                | buffer[ptr + 1] << 8) << 16 >> 16;
        },
        set: function set_short(ptr, value) {
            buffer[ptr] = value & 255;
            buffer[ptr + 1] = value >>> 8 & 255;
        }
    };
    memory.ushort = memory.u16 = {
        get: function get_ushort(ptr) {
            return buffer[ptr]
                | buffer[ptr + 1] << 8;
        },
        set: function set_ushort(ptr, value) {
            buffer[ptr] = value & 255;
            buffer[ptr + 1] = value >>> 8 & 255;
        }
    };
    memory.int = memory.s32 = {
        get: function get_int(ptr) {
            return buffer[ptr]
                | buffer[ptr + 1] << 8
                | buffer[ptr + 2] << 16
                | buffer[ptr + 3] << 24;
        },
        set: function set_int(ptr, value) {
            buffer[ptr] = value & 255;
            buffer[ptr + 1] = value >>> 8 & 255;
            buffer[ptr + 2] = value >>> 16 & 255;
            buffer[ptr + 3] = value >>> 24;
        }
    };
    memory.uint = memory.u32 = {
        get: function get_uint(ptr) {
            return (buffer[ptr]
                | buffer[ptr + 1] << 8
                | buffer[ptr + 2] << 16
                | buffer[ptr + 3] << 24) >>> 0;
        },
        set: function set_uint(ptr, value) {
            buffer[ptr] = value & 255;
            buffer[ptr + 1] = value >>> 8 & 255;
            buffer[ptr + 2] = value >>> 16 & 255;
            buffer[ptr + 3] = value >>> 24;
        }
    };
    function get_long_s(ptr, unsigned) {
        var lo = buffer[ptr]
            | buffer[ptr + 1] << 8
            | buffer[ptr + 2] << 16
            | buffer[ptr + 3] << 24;
        var hi = buffer[ptr + 4]
            | buffer[ptr + 5] << 8
            | buffer[ptr + 6] << 16
            | buffer[ptr + 7] << 24;
        return LongModule
            ? LongModule.fromBits(lo, hi, !!unsigned)
            : { low: lo, high: hi, unsigned: !!unsigned };
    }
    function set_long_s(ptr, value) {
        buffer[ptr] = value.low & 255;
        buffer[ptr + 1] = value.low >>> 8 & 255;
        buffer[ptr + 2] = value.low >>> 16 & 255;
        buffer[ptr + 3] = value.low >>> 24;
        buffer[ptr + 4] = value.high & 255;
        buffer[ptr + 5] = value.high >>> 8 & 255;
        buffer[ptr + 6] = value.high >>> 16 & 255;
        buffer[ptr + 7] = value.high >>> 24;
    }
    memory.long = memory.s64 = {
        get: function get_long(ptr) { return get_long_s(ptr, false); },
        set: set_long_s
    };
    memory.ulong = memory.u64 = {
        get: function get_ulong(ptr) { return get_long_s(ptr, true); },
        set: set_long_s
    };
    var f64 = new Float64Array([-0]);
    var f32 = new Float32Array(f64.buffer);
    var f8b = new Uint8Array(f64.buffer);
    var fle = f8b[7] === 128;
    memory.float = memory.f32 = {
        get: function get_float(ptr) {
            if (fle) {
                f8b[0] = buffer[ptr];
                f8b[1] = buffer[ptr + 1];
                f8b[2] = buffer[ptr + 2];
                f8b[3] = buffer[ptr + 3];
            }
            else {
                f8b[3] = buffer[ptr];
                f8b[2] = buffer[ptr + 1];
                f8b[1] = buffer[ptr + 2];
                f8b[0] = buffer[ptr + 3];
            }
            return f32[0];
        },
        set: function set_float(ptr, value) {
            f32[0] = value;
            if (fle) {
                buffer[ptr] = f8b[0];
                buffer[ptr + 1] = f8b[1];
                buffer[ptr + 2] = f8b[2];
                buffer[ptr + 3] = f8b[3];
            }
            else {
                buffer[ptr] = f8b[3];
                buffer[ptr + 1] = f8b[2];
                buffer[ptr + 2] = f8b[1];
                buffer[ptr + 3] = f8b[0];
            }
        }
    };
    memory.double = memory.f64 = {
        get: function get_double(ptr) {
            if (fle) {
                f8b[0] = buffer[ptr];
                f8b[1] = buffer[ptr + 1];
                f8b[2] = buffer[ptr + 2];
                f8b[3] = buffer[ptr + 3];
                f8b[4] = buffer[ptr + 4];
                f8b[5] = buffer[ptr + 5];
                f8b[6] = buffer[ptr + 6];
                f8b[7] = buffer[ptr + 7];
            }
            else {
                f8b[7] = buffer[ptr];
                f8b[6] = buffer[ptr + 1];
                f8b[5] = buffer[ptr + 2];
                f8b[4] = buffer[ptr + 3];
                f8b[3] = buffer[ptr + 4];
                f8b[2] = buffer[ptr + 5];
                f8b[1] = buffer[ptr + 6];
                f8b[0] = buffer[ptr + 7];
            }
            return f64[0];
        },
        set: function set_double(ptr, value) {
            f64[0] = value;
            if (fle) {
                buffer[ptr] = f8b[0];
                buffer[ptr + 1] = f8b[1];
                buffer[ptr + 2] = f8b[2];
                buffer[ptr + 3] = f8b[3];
                buffer[ptr + 4] = f8b[4];
                buffer[ptr + 5] = f8b[5];
                buffer[ptr + 6] = f8b[6];
                buffer[ptr + 7] = f8b[7];
            }
            else {
                buffer[ptr] = f8b[7];
                buffer[ptr + 1] = f8b[6];
                buffer[ptr + 2] = f8b[5];
                buffer[ptr + 3] = f8b[4];
                buffer[ptr + 4] = f8b[3];
                buffer[ptr + 5] = f8b[2];
                buffer[ptr + 6] = f8b[1];
                buffer[ptr + 7] = f8b[0];
            }
        }
    };
    memory.array = {
        get: function get_array(ptr) {
            var capacity = memory.int.get(ptr);
            var length = memory.int.get(ptr + 4);
            return {
                capacity: capacity,
                length: length,
                base: ptr + exports.arrayHeaderSize
            };
        },
        create: function create_array(length, elementByteSize) {
            var size = length * elementByteSize;
            var ptr = malloc(exports.arrayHeaderSize + size);
            memory.int.set(ptr, length);
            memory.int.set(ptr + 4, length);
            memset(ptr + exports.arrayHeaderSize, 0, size - exports.arrayHeaderSize);
            return {
                ptr: ptr,
                base: ptr + exports.arrayHeaderSize
            };
        }
    };
    memory.string = {
        get: function get_string(ptr) {
            var capacity = memory.int.get(ptr);
            var length = memory.int.get(ptr + 4);
            var chars = new Array(length);
            for (var i = 0, base = exports.arrayHeaderSize + ptr; i < length; ++i)
                chars[i] = memory.ushort.get(base + (i << 1));
            return String.fromCharCode.apply(String, chars);
        },
        create: function create_string(value) {
            var size = value.length << 1;
            var ptr = malloc(exports.arrayHeaderSize + size);
            memory.int.set(ptr, value.length);
            memory.int.set(ptr + 4, value.length);
            memset(ptr + exports.arrayHeaderSize, 0, size - exports.arrayHeaderSize);
            for (var i = 0, base = exports.arrayHeaderSize + ptr; i < value.length; ++i)
                memory.ushort.set(base + (i << 1), value.charCodeAt(i));
            return ptr;
        }
    };
    return memory;
}
exports.initializeMemory = initializeMemory;
function load(file, options) {
    if (!options)
        options = {};
    var imports = (options.imports || {});
    var exports = (options.exports || {});
    var memory = (options.memory || null);
    var module = {
        imports: imports,
        exports: exports,
        memory: memory,
        log: function (type, message) {
            var stype;
            switch (type) {
                case 1:
                    stype = "info";
                    break;
                case 2:
                    stype = "warn";
                    break;
                case 3:
                    stype = "error";
                    break;
                default: stype = "log";
            }
            console[stype](message);
        }
    };
    if (!imports.lib)
        imports.lib = {};
    if (!imports.lib.log)
        imports.lib.log = function (type, messagePtr) { return module.log(type, memory.string.get(messagePtr)); };
    if (!imports.lib.resize)
        imports.lib.resize = function () {
            initializeMemory(memory, exports.malloc || imports.lib.malloc, exports.memset || imports.lib.memset);
        };
    var resolveReady;
    var rejectReady;
    if (!exports.ready)
        exports.ready = new Promise(function (resolve, reject) {
            resolveReady = resolve;
            rejectReady = reject;
        });
    return (typeof file === "string"
        ? exports.xfetch(file)
            .then(function (result) { return result.arrayBuffer(); })
            .then(function (buffer) { return WebAssembly.instantiate(buffer, imports); })
        : WebAssembly.instantiate(file, imports))
        .catch(function (reason) {
        rejectReady(reason);
        return Promise.reject(reason);
    })
        .then(function (result) {
        for (var keys = Object.keys(result.instance.exports), i = 0; i < keys.length; ++i)
            module.exports[keys[i]] = result.instance.exports[keys[i]];
        if (module.exports.memory)
            memory = module.memory = module.exports.memory;
        imports.lib.resize();
        resolveReady(module);
        return module;
    });
}
exports.load = load;
exports.default = load;
var fs;
exports.xfetch = typeof fetch === "function" ? fetch : function fetch_node(file) {
    return new Promise(function (resolve, reject) {
        (fs || (fs = eval("equire".replace(/^/, "r"))("fs")))
            .readFile(file, function (err, data) {
            return err
                ? reject(err)
                : resolve({ arrayBuffer: function () { return data; } });
        });
    });
};
