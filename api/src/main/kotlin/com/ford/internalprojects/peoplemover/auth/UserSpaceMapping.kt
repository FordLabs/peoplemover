package com.ford.internalprojects.peoplemover.auth

import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.io.Serializable
import java.time.LocalDateTime
import javax.persistence.*

@Entity
@EntityListeners(AuditingEntityListener::class)
data class UserSpaceMapping  (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Int? = null,

        @Column(name = "user_id")
        val userId: String?,

        @Column(name = "space_id")
        val spaceId: Int?,

        @Column(name = "last_modified_date")
        @UpdateTimestamp
        val lastModifiedDate: LocalDateTime? = null,

        @Column(name = "created_date")
        @CreationTimestamp
        val createdDate: LocalDateTime? = null

)