package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.interaction.Conversation;
import com.khangdev.elearningbe.entity.interaction.ConversationParticipant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("""
    select distinct c 
    from Conversation c 
    join c.participants p
    where p.user.id = :userId
    order by c.lastMessageAt desc
""")
    List<Conversation> findByUserId(@Param("userId") UUID userId);

    @Query("""
    select distinct c
    from Conversation c
    join c.participants pOther
    join c.participants pMe
    where c.isGroup = false
      and pMe.user.id = :myId
      and pOther.user.id in :otherIds
""")
    List<Conversation> findDirectConversationsWithUsers(
            @Param("myId") UUID myId,
            @Param("otherIds") List<UUID> otherIds
    );

    @Query("""
select distinct c from Conversation c
join c.participants pOther
join c.participants pMe
where c.isGroup = true
and pMe.user.id = :myId
and pOther.user.id = :otherId
""")
    Optional<Conversation> findDirectConversation(@Param("myId") UUID myId, @Param("otherId") UUID otherId);



    @Query("""
    select c from Conversation c
    left join c.participants p
    where
        p.user.email = :currentEmail
        and c.name like concat("%", :name, "%")
""")
    List<Conversation> searchByNameLike(@Param("name") String name, @Param("currentEmail") String currentEmail);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select c
        from Conversation c
        join c.participants p
        where c.isAi = true
          and p.user.id = :userId
    """)
    Optional<Conversation> findAiConversationByUserId(@Param("userId") UUID userId);

}
