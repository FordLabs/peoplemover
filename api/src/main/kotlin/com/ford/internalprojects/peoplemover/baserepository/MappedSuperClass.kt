package com.ford.internalprojects.peoplemover.baserepository

import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import javax.persistence.Column
import javax.persistence.EntityListeners
import javax.persistence.MappedSuperclass


@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class Auditable (

    @Column(name = "last_modified_date")
    @UpdateTimestamp
    val lastModifiedDate: LocalDateTime? = null,

    @Column(name = "last_modified_by")
    @LastModifiedBy
    var lastModifiedBy: String? = null,

    @Column(name = "created_date")
    @CreationTimestamp
    val createdDate: LocalDateTime? = null,

    @Column(name = "created_by")
    @CreatedBy
    var createdBy: String? = null
)
