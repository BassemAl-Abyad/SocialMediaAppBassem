"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenTypeEnum = exports.SignatureEnum = exports.RoleEnum = exports.GenderEnum = void 0;
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "MALE";
    GenderEnum["FEMALE"] = "FEMALE";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["USER"] = "USER";
    RoleEnum["ADMIN"] = "ADMIN";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var SignatureEnum;
(function (SignatureEnum) {
    SignatureEnum[SignatureEnum["USER"] = 0] = "USER";
    SignatureEnum[SignatureEnum["ADMIN"] = 1] = "ADMIN";
})(SignatureEnum || (exports.SignatureEnum = SignatureEnum = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["ACCESS"] = "ACCESS";
    TokenTypeEnum["REFRESH"] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
