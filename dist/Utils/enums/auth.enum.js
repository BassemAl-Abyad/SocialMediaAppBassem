"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityEnum = exports.ProviderEnum = exports.LogoutTypeEnum = exports.TokenTypeEnum = exports.SignatureEnum = exports.RoleEnum = exports.GenderEnum = void 0;
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
var LogoutTypeEnum;
(function (LogoutTypeEnum) {
    LogoutTypeEnum["LOGOUT"] = "LOGOUT";
    LogoutTypeEnum["LOGOUT_FROM_ALL"] = "LOGOUT_FROM_ALL";
})(LogoutTypeEnum || (exports.LogoutTypeEnum = LogoutTypeEnum = {}));
var ProviderEnum;
(function (ProviderEnum) {
    ProviderEnum["SYSTEM"] = "SYSTEM";
    ProviderEnum["GOOGLE"] = "GOOGLE";
})(ProviderEnum || (exports.ProviderEnum = ProviderEnum = {}));
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum[AvailabilityEnum["PUBLIC"] = 0] = "PUBLIC";
    AvailabilityEnum[AvailabilityEnum["FRIENDS"] = 1] = "FRIENDS";
    AvailabilityEnum[AvailabilityEnum["ONLY_ME"] = 2] = "ONLY_ME";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
