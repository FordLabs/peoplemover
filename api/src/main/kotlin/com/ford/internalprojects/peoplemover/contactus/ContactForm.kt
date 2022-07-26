package com.ford.internalprojects.peoplemover.contactus

import lombok.AllArgsConstructor
import lombok.Getter
import lombok.Setter

@Getter
@Setter
@AllArgsConstructor
class ContactForm {
    private val name: String = "";
    private var email: String = "";
    private var userType: String = "";
    private var message: String = "";

    fun createStringForSlack(): String? {
        return "{\"text\":" +
                name +
                " (" + email + ") " +
                "of user type" +
                userType +
                "says: " +
                message
                "\"}"
    }

}
