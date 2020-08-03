package com.ford.internalprojects.peoplemover.auth

data class OAuthVerifyResponse (
    var user_id: String,
    var scopes: List<String>,
    var exp: Long,
    var iss: String,
    var sub: String
)