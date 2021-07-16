package com.ford.internalprojects.peoplemover.person

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class PersonTest {

    @Test
    fun `Person must have a newPersonDate set if newPerson flag is set`() {
        var testPerson = Person(name = "testPerson name", spaceUuid = "space-uuid", newPerson = true)
        assertThat(testPerson.newPerson).isTrue()
        assertThat(testPerson.newPersonDate).isToday()
    }
}
