function nonReturnTypeFieldParser() {}

function scalarReturnTypeFieldParser() {}

function objectReturnTypeFieldParser() {}

function primitiveArrayReturnTypeFieldParser() {}

function objectArrayReturnTypeFieldParser() {}

/**
 * {
 *   a: 1,
 *   b: "linbudu",
 *   c: true,
 *   d: {
 *      da: 1
 *    },
 *   e: [ 1,2,3,4,5 ],
 *   f: [
 *    {
 *     fa: 1
 *    }
 *  ]
 * }
 *
 * [
 *   { type: "number", key: "a", nested: false, returnType: "Int"},
 *   { type: "string", key: "b", nested: false, returnType: null},
 *   { type: "boolean", key: "c", nested: false, returnType: null},
 *    用 enum 标记
 *   { type: "object", key: "d", nested: true, returnType: "D"
 *    fields: [ { type: "number", key: "da", nested: false, returnType: "Int"} ]}
 *  { type:"array", key:"e", nested: false, returnType: "[Int]"}
 *   { type:"object_array", key:"f", returnType: "[F]"
 *    fields: [ { type: "object", key: "fa", nested: true, returnType: "F"} ]
 *  }
 * ]
 *
 *
 *
 */
