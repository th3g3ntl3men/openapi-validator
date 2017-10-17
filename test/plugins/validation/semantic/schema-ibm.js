import expect from "expect"
import { validate } from "plugins/validation/semantic-validators/validators/schema-ibm"

describe("validation plugin - semantic - schema-ibm", () => {

  it("should return an error when a property does not use a well defined property type", () => {

    const config = {
      "schemas" : {
        "invalid_type_format_pair": "error"
      }
    }

    const spec = {
      definitions: {
        WordStyle: {
          type: "object",
          properties: {
            level: {
              type: "number",
              format: "integer",
              description: "Good to have a description"
            }
          }
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].path).toEqual(["definitions", "WordStyle", "properties", "level", "type"])
    expect(res.errors[0].message).toEqual("Properties must use well defined property types.")
    expect(res.warnings.length).toEqual(0)
  })

  it("should return an error when an array property's items does not use a well defined property type", () => {
    
    const config = {
      "schemas" : {
        "invalid_type_format_pair": "error"
      }
    }

    const spec = {
      definitions: {
        Thing: {
          type: "object",
          properties: {
            level: {
              type: "array",
              description: "has some items",
              items: {
                type: "number",
                format: "integer"
              }
            }
          }
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].path).toEqual(["definitions", "Thing", "properties", "level", "items", "type"])
    expect(res.errors[0].message).toEqual("Properties must use well defined property types.")
    expect(res.warnings.length).toEqual(0)
  })

  it("should not error when an array property's items is a ref", () => {
    
    const config = {
      "schemas" : {
        "invalid_type_format_pair": "error"
      }
    }

    const spec = {
      definitions: {
        Thing: {
          type: "object",
          properties: {
            level: {
              type: "array",
              description: "has one item, its a ref",
              items: {
                $ref: "#/definitions/levelItem"
              }
            }
          }
        },
        levelItem: {
          type: "string"
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(0)
    expect(res.warnings.length).toEqual(0)
  })

  it("should return an error when a response does not use a well defined property type", () => {
    
    const config = {
      "schemas" : {
        "invalid_type_format_pair": "error"
      }
    }

    const spec = {
      responses: {
        Thing: {
          schema: {
            properties: {
              level: {
                type: "number",
                format: "integer",
                description: "i need better types"
              }
            }
          }
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].path).toEqual(["responses", "Thing", "schema", "properties", "level", "type"])
    expect(res.errors[0].message).toEqual("Properties must use well defined property types.")
    expect(res.warnings.length).toEqual(0)
  })

  it("should return an error when a schema property has no description", () => {
    
    const config = {
      "schemas" : {
        "no_property_description": "warning"
      }
    }

    const spec = {
      "paths": {
        "/pets": {
          "get": {
            "parameters": [
              {
                "name": "good_name",
                "in": "body",
                "description": "Not a bad description",
                "schema": {
                  "type": "object",
                  "properties": {
                    "badProperty": {
                      "type": "string"
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(0)
    expect(res.warnings.length).toEqual(1)
    expect(res.warnings[0].path).toEqual(["paths", "/pets", "get", "parameters", "0", "schema", "properties", "badProperty", "description"])
    expect(res.warnings[0].message).toEqual("Schema properties must have a description with content in it.")
  })

  it("should return an error when JSON is in the description", () => {
    
    const config = {
      "schemas" : {
        "description_mentions_json": "warning"
      }
    }

    const spec = {
      "paths": {
        "/pets": {
          "get": {
            "parameters": [
              {
                "name": "good_name",
                "in": "body",
                "description": "Not a bad description",
                "schema": {
                  "type": "object",
                  "properties": {
                    "anyObject": {
                      "type": "object",
                      "description": "it is not always a JSON object"
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(0)
    expect(res.warnings.length).toEqual(1)
    expect(res.warnings[0].path).toEqual(["paths", "/pets", "get", "parameters", "0", "schema", "properties", "anyObject", "description"])
    expect(res.warnings[0].message).toEqual("Not all languages use JSON, so descriptions should not state that the model is a JSON object.")
  })

  it("should not die when a schema contains a description property", () => {
    
    const config = {
      "schemas" : {
        "invalid_type_format_pair": "error",
        "no_property_description": "warning",
        "description_mentions_json": "warning"
      }
    }

    const spec = {
      "definitions": {
        "Notice": {
          "type": "object",
          "description": "A notice produced for the collection",
          "properties": {
            "notice_id": {
              "type": "string",
              "readOnly": true,
              "description": "Identifies the notice. Many notices may have the same ID. This field exists so that user applications can programmatically identify a notice and take automatic corrective action."
            },
            "description": {
              "type": "string",
              "readOnly": true,
              "description": "The description of the notice"
            }
          }
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(0)
    expect(res.warnings.length).toEqual(0)
  })

  it("should not complain about anything when x-sdk-exclude is true", () => {
    
    const config = {
      "schemas" : {
        "invalid_type_format_pair": "error",
        "no_property_description": "warning",
        "description_mentions_json": "warning"
      }
    }

    const spec = {
      "paths": {
        "/pets": {
          "get": {
            "x-sdk-exclude": true,
            "parameters": [
              {
                "name": "good_name",
                "in": "body",
                "description": "Not a bad description",
                "schema": {
                  "type": "integer",
                  "properties": {
                    "badProperty": {
                      "type": "string"
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }

    let res = validate({ jsSpec: spec }, config)
    expect(res.errors.length).toEqual(0)
    expect(res.warnings.length).toEqual(0)
  })

})
