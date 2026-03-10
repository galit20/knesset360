-- OData to PostgreSQL Schema Generation
-- Generated for OdataService.DAL.ParliamentInfo and OdataService.DAL.Lobbyist
-- Based on https://knesset.gov.il/OdataV4/ParliamentInfo/$metadata

CREATE TABLE KNS_Agenda (
    ID INT NOT NULL PRIMARY KEY,
    Number INT,
    ClassificationID INT,
    ClassificationDesc TEXT,
    LeadingAgendaID INT,
    KnessetNum INT,
    Name TEXT,
    SubTypeID INT,
    SubTypeDesc TEXT,
    StatusID INT,
    InitiatorPersonID INT,
    GovRecommendationID INT,
    GovRecommendationDesc TEXT,
    PresidentDecisionDate TIMESTAMPTZ,
    PostopenmentReasonID INT,
    PostopenmentReasonDesc TEXT,
    CommitteeID INT,
    RecommendCommitteeID INT,
    MinisterPersonID INT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_Bill (
    ID INT NOT NULL PRIMARY KEY,
    KnessetNum INT,
    Name TEXT,
    TypeID INT,
    TypeDesc TEXT,
    SubTypeID INT,
    SubTypeDesc TEXT,
    PrivateNumber INT,
    CommitteeID INT,
    StatusID INT,
    Number INT,
    PostponementReasonID INT,
    PostponementReasonDesc TEXT,
    PublicationDate TIMESTAMPTZ,
    PublicationSeriesID INT,
    PublicationSeriesDesc TEXT,
    PublicationSeriesFirstCallID INT,
    PublicationSeriesFirstCallDesc TEXT,
    MagazineNumber TEXT,
    PageNumber TEXT,
    IsContinuationBill BOOLEAN,
    SummaryLaw TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_BillHistoryInitiator (
    ID INT NOT NULL PRIMARY KEY,
    BillID INT,
    PersonID INT,
    IsInitiator BOOLEAN,
    StartDate TIMESTAMPTZ,
    EndDate TIMESTAMPTZ,
    ReasonID INT,
    ReasonDesc TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_BillInitiator (
    ID INT NOT NULL PRIMARY KEY,
    BillID INT,
    PersonID INT,
    IsInitiator BOOLEAN,
    Ordinal INT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_BillName (
    ID INT NOT NULL PRIMARY KEY,
    BillID INT,
    Name TEXT,
    NameHistoryTypeID INT,
    NameHistoryTypeDesc TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_BillSplit (
    ID INT NOT NULL PRIMARY KEY,
    MainBillID INT,
    SplitBillID INT,
    Name TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_BillUnion (
    ID INT NOT NULL PRIMARY KEY,
    MainBillID INT,
    UnionBillID INT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_BroadcastCommitteSession (
    ID INT NOT NULL PRIMARY KEY,
    BroadcastID INT,
    BroadcastUrl TEXT
);

CREATE TABLE KNS_CmtSessionItem (
    ID INT NOT NULL PRIMARY KEY,
    ItemID INT,
    CommitteeSessionID INT,
    Ordinal INT,
    StatusID INT,
    Name TEXT,
    ItemTypeID INT,
    LastUpdatedDate TIMESTAMPTZ NOT NULL
);

CREATE TABLE KNS_CmtSiteCode (
    ID INT NOT NULL PRIMARY KEY,
    KnsID INT,
    SiteId INT
);

CREATE TABLE KNS_Committee (
    ID INT NOT NULL PRIMARY KEY,
    Name TEXT,
    CategoryID SMALLINT,
    CategoryDesc TEXT,
    KnessetNum INT,
    CommitteeTypeID INT,
    CommitteeTypeDesc TEXT,
    Email TEXT,
    StartDate TIMESTAMPTZ,
    FinishDate TIMESTAMPTZ,
    AdditionalTypeID INT,
    AdditionalTypeDesc TEXT,
    ParentCommitteeID INT,
    CommitteeParentName TEXT,
    IsCurrent BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_CommitteeSession (
    ID INT NOT NULL PRIMARY KEY,
    Number INT,
    KnessetNum INT,
    TypeID INT,
    TypeDesc TEXT,
    CommitteeID INT,
    StatusID INT,
    StatusDesc TEXT,
    Location TEXT,
    SessionUrl TEXT,
    BroadcastUrl TEXT,
    StartDate TIMESTAMPTZ,
    FinishDate TIMESTAMPTZ,
    Note TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_DocumentAgenda (
    ID INT NOT NULL PRIMARY KEY,
    AgendaID INT,
    GroupTypeID SMALLINT,
    GroupTypeDesc TEXT,
    ApplicationID SMALLINT,
    ApplicationDesc TEXT,
    FilePath TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_DocumentBill (
    ID INT NOT NULL PRIMARY KEY,
    BillID INT,
    GroupTypeID SMALLINT,
    GroupTypeDesc TEXT,
    ApplicationID SMALLINT,
    ApplicationDesc TEXT,
    FilePath TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_DocumentCommitteeSession (
    ID INT NOT NULL PRIMARY KEY,
    CommitteeSessionID INT,
    GroupTypeID SMALLINT,
    GroupTypeDesc TEXT,
    DocumentName TEXT,
    ApplicationID SMALLINT,
    ApplicationDesc TEXT,
    FilePath TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_DocumentIsraelLaw (
    ID INT NOT NULL PRIMARY KEY,
    IsraelLawID INT,
    GroupTypeID SMALLINT,
    GroupTypeDesc TEXT,
    ApplicationID SMALLINT,
    ApplicationDesc TEXT,
    FilePath TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_DocumentPlenumSession (
    ID INT NOT NULL PRIMARY KEY,
    PlenumSessionID INT,
    GroupTypeID SMALLINT,
    GroupTypeDesc TEXT,
    ApplicationID SMALLINT,
    ApplicationDesc TEXT,
    FilePath TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_DocumentQuery (
    ID INT NOT NULL PRIMARY KEY,
    QueryID INT,
    GroupTypeID SMALLINT,
    GroupTypeDesc TEXT,
    ApplicationID SMALLINT,
    ApplicationDesc TEXT,
    FilePath TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_DocumentSecondaryLaw (
    ID INT NOT NULL PRIMARY KEY,
    SecondaryLawID INT,
    GroupTypeID SMALLINT,
    GroupTypeDesc TEXT,
    ApplicationID SMALLINT,
    ApplicationDesc TEXT,
    FilePath TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_Faction (
    ID INT NOT NULL PRIMARY KEY,
    Name TEXT,
    KnessetNum INT,
    StartDate TIMESTAMPTZ,
    FinishDate TIMESTAMPTZ,
    IsCurrent BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_GovMinistry (
    ID INT NOT NULL PRIMARY KEY,
    Name TEXT,
    IsActive BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ,
    CategoryID INT,
    CategoryName TEXT,
    GovID INT
);

CREATE TABLE KNS_IsraelLaw (
    ID INT NOT NULL PRIMARY KEY,
    KnessetNum INT,
    Name TEXT,
    IsBasicLaw BOOLEAN,
    IsFavoriteLaw BOOLEAN,
    PublicationDate TIMESTAMPTZ,
    LatestPublicationDate TIMESTAMPTZ,
    IsBudgetLaw BOOLEAN,
    LawValidityID INT,
    LawValidityDesc TEXT,
    ValidityStartDate TIMESTAMPTZ,
    ValidityStartDateNotes TEXT,
    ValidityFinishDate TIMESTAMPTZ,
    ValidityFinishDateNotes TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_IsraelLawBinding (
    ID INT NOT NULL PRIMARY KEY,
    IsraelLawID INT,
    IsraelLawReplacedID INT,
    LawID INT,
    LawTypeID INT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_IsraelLawClassificiation (
    ID INT NOT NULL PRIMARY KEY,
    IsraelLawID INT,
    ClassificiationID INT,
    ClassificiationDesc TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_IsraelLawLawCorrections (
    ID INT NOT NULL PRIMARY KEY,
    LawCorrectionID INT NOT NULL,
    IsraelLawID INT NOT NULL,
    LastUpdatedBy INT NOT NULL,
    LastUpdatedDate TIMESTAMPTZ NOT NULL
);

CREATE TABLE KNS_IsraelLawMinistry (
    ID INT NOT NULL PRIMARY KEY,
    IsraelLawID INT,
    LastUpdatedDate TIMESTAMPTZ,
    MinistryCategoryID INT NOT NULL,
    MinistryCategoryDesc TEXT
);

CREATE TABLE KNS_IsraelLawName (
    ID INT NOT NULL PRIMARY KEY,
    IsraelLawID INT,
    LawID INT,
    LawTypeID INT,
    Name TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_ItemType (
    ID INT NOT NULL PRIMARY KEY,
    "Desc" TEXT,
    TableName TEXT
);

CREATE TABLE KNS_JointCommittee (
    ID INT NOT NULL PRIMARY KEY,
    CommitteeID INT,
    ParticipantCommitteeID INT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_KnessetDates (
    ID INT NOT NULL PRIMARY KEY,
    KnessetNum INT,
    Name TEXT,
    Assembly INT,
    Plenum INT,
    PlenumStart TIMESTAMPTZ,
    PlenumFinish TIMESTAMPTZ,
    IsCurrent BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_LawBinding (
    ID INT NOT NULL PRIMARY KEY,
    LawID INT,
    IsraelLawID INT,
    ParentLawID INT,
    LawTypeID INT,
    LawParentTypeID INT,
    BindingType INT,
    BindingTypeDesc TEXT,
    PageNumber TEXT,
    AmendmentType INT,
    AmendmentTypeDesc TEXT,
    LastUpdatedDate TIMESTAMPTZ,
    IsTempLegislation BOOLEAN,
    IsSecondaryAmendment BOOLEAN,
    CorrectionNumber INT,
    ParagraphNumber TEXT
);

CREATE TABLE KNS_LawCorrections (
    ID INT NOT NULL PRIMARY KEY,
    BillID INT NOT NULL,
    CorrectionTypeID INT NOT NULL,
    CorrectionTypeDesc TEXT,
    IsKnessetInvolvement BOOLEAN,
    CommitteeID INT,
    CorrectionStatusID INT NOT NULL,
    CorrectionStatusDesc TEXT,
    VoteDate TIMESTAMPTZ,
    PublicationDate TIMESTAMPTZ,
    PublicationSeriesID INT,
    PublicationSeriesDesc TEXT,
    MagazineNumber TEXT,
    PageNumber TEXT,
    CommencementDate TIMESTAMPTZ,
    LastUpdatedBy INT NOT NULL,
    LastUpdatedDate TIMESTAMPTZ NOT NULL,
    CreatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_MkSiteCode (
    ID INT NOT NULL PRIMARY KEY,
    KnsID INT,
    SiteId INT
);

CREATE TABLE KNS_Person (
    ID INT NOT NULL PRIMARY KEY,
    LastName TEXT,
    FirstName TEXT,
    GenderID INT,
    GenderDesc TEXT,
    Email TEXT,
    IsCurrent BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_PersonToPosition (
    ID INT NOT NULL PRIMARY KEY,
    PersonID INT,
    PositionID INT,
    KnessetNum INT,
    StartDate TIMESTAMPTZ,
    FinishDate TIMESTAMPTZ,
    GovMinistryID INT,
    GovMinistryName TEXT,
    DutyDesc TEXT,
    FactionID INT,
    FactionName TEXT,
    GovernmentNum INT,
    CommitteeID INT,
    CommitteeName TEXT,
    IsCurrent BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_PlenumSession (
    ID INT NOT NULL PRIMARY KEY,
    Number INT,
    KnessetNum INT,
    Name TEXT,
    StartDate TIMESTAMPTZ,
    FinishDate TIMESTAMPTZ,
    IsSpecialMeeting BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_PlenumVote (
    ID INT NOT NULL PRIMARY KEY,
    VoteDateTime TIMESTAMPTZ,
    SessionID INT,
    ItemID INT,
    Ordinal INT,
    VoteMethodID INT,
    VoteMethodDesc TEXT,
    VoteStatusCode INT,
    VoteStatusDesc TEXT,
    VoteTitle TEXT,
    VoteSubject TEXT,
    IsNoConfidenceInGov BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ,
    ForOptionID INT,
    ForOptionDesc TEXT,
    AgainstOptionID INT,
    AgainstOptionDesc TEXT
);

CREATE TABLE KNS_PlenumVoteResult (
    ID INT NOT NULL PRIMARY KEY,
    MkID INT,
    VoteID INT,
    VoteDate TIMESTAMPTZ,
    ResultCode INT,
    ResultDesc TEXT,
    LastUpdatedDate TIMESTAMPTZ,
    LastName TEXT,
    FirstName TEXT,
    SessionID INT,
    ItemID INT
);

CREATE TABLE KNS_PlmSessionItem (
    ID INT NOT NULL PRIMARY KEY,
    ItemID INT,
    PlenumSessionID INT,
    ItemTypeID INT,
    ItemTypeDesc TEXT,
    Ordinal BIGINT,
    Name TEXT,
    StatusID INT,
    IsDiscussion INT,
    LastUpdatedDate TIMESTAMPTZ NOT NULL
);

CREATE TABLE KNS_Position (
    ID INT NOT NULL PRIMARY KEY,
    Description TEXT,
    GenderID INT,
    GenderDesc TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_Query (
    ID INT NOT NULL PRIMARY KEY,
    Number INT,
    KnessetNum INT,
    Name TEXT,
    TypeID INT,
    TypeDesc TEXT,
    StatusID INT,
    PersonID INT,
    GovMinistryID INT,
    SubmitDate TIMESTAMPTZ,
    ReplyMinisterDate TIMESTAMPTZ,
    ReplyDatePlanned TIMESTAMPTZ,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_SecLawAuthorizingLaw (
    ID INT NOT NULL PRIMARY KEY,
    AuthorizingLawID INT,
    SecondaryLawID INT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_SecLawRegulator (
    ID INT NOT NULL PRIMARY KEY,
    SecondaryLawID INT,
    RegulatorTypeID INT,
    RegulatorTypeDesc TEXT,
    RegulatorID INT,
    RegulatorDesc TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_SecondaryLaw (
    ID INT NOT NULL PRIMARY KEY,
    KnessetNum INT,
    Name TEXT,
    CompletionCauseID INT,
    CompletionCauseDesc TEXT,
    PostponementReasonID INT,
    PostponementReasonDesc TEXT,
    KnessetInvolvementID INT,
    KnessetInvolvementDesc TEXT,
    CommitteeID INT,
    PublicationSeriesID INT,
    PublicationSeriesDesc TEXT,
    MagazineNumber TEXT,
    PageNumber TEXT,
    PublicationDate TIMESTAMPTZ,
    MajorAuthorizingLawID INT,
    CommitteeReceivedDate TIMESTAMPTZ,
    CommitteeApprovalDate TIMESTAMPTZ,
    ApprovalDateWithoutDiscussion TIMESTAMPTZ,
    IsAmmendingLawOriginal BOOLEAN,
    ClassificationID INT,
    ClassificationDesc TEXT,
    IsEmergency BOOLEAN,
    SecretaryReceivedDate TIMESTAMPTZ,
    PlenumApprovalDate TIMESTAMPTZ,
    TypeID INT,
    TypeDesc TEXT,
    StatusID INT,
    StatusName TEXT,
    IsCurrent BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_SecToSecBinding (
    ID INT NOT NULL PRIMARY KEY,
    SecChildID INT,
    SecChildTypeID INT,
    SecParentID INT,
    SecParentTypeID INT,
    SecMainID INT,
    SecMainTypeID INT,
    BindingTypeID INT,
    BindingTypeDesc TEXT,
    IsTempLegislation BOOLEAN,
    IsSecondaryAmendment BOOLEAN,
    CorrectionNumber INT,
    AmendmentTypeID INT,
    AmendmentTypeDesc TEXT,
    ParagraphNumber TEXT,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE KNS_Status (
    ID INT NOT NULL PRIMARY KEY,
    "Desc" TEXT,
    TypeID INT,
    TypeDesc TEXT,
    OrderTransition INT,
    IsActive BOOLEAN,
    LastUpdatedDate TIMESTAMPTZ
);

CREATE TABLE V_Lobbyist (
    ID INT NOT NULL PRIMARY KEY,
    IdentityNumber TEXT,
    FullName TEXT,
    PermitTypeValue TEXT,
    Key INT NOT NULL,
    CorporationName TEXT,
    IsIndependent BOOLEAN,
    CorpNumber TEXT,
    PracticeFramework TEXT,
    IsMemberInFaction TEXT,
    MemberInFaction BOOLEAN
);

CREATE TABLE V_LobbyistsClient (
    ID INT NOT NULL PRIMARY KEY,
    LobbyistID INT NOT NULL,
    ClientID INT NOT NULL,
    Name TEXT,
    ClientsNames TEXT
);


-- All foreign Key Constraints

-- -- Foreign Key Constraints for KNS_Agenda
-- ALTER TABLE KNS_Agenda ADD CONSTRAINT fk_agenda_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);
-- ALTER TABLE KNS_Agenda ADD CONSTRAINT fk_agenda_recommend_committee FOREIGN KEY (RecommendCommitteeID) REFERENCES KNS_Committee(ID);
-- ALTER TABLE KNS_Agenda ADD CONSTRAINT fk_agenda_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);
-- ALTER TABLE KNS_Agenda ADD CONSTRAINT fk_agenda_minister_person FOREIGN KEY (MinisterPersonID) REFERENCES KNS_Person(ID);
-- ALTER TABLE KNS_Agenda ADD CONSTRAINT fk_agenda_initiator_person FOREIGN KEY (InitiatorPersonID) REFERENCES KNS_Person(ID);

-- -- Foreign Key Constraints for KNS_Bill
-- ALTER TABLE KNS_Bill ADD CONSTRAINT fk_bill_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);
-- ALTER TABLE KNS_Bill ADD CONSTRAINT fk_bill_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);

-- -- Foreign Key Constraints for KNS_BillHistoryInitiator
-- ALTER TABLE KNS_BillHistoryInitiator ADD CONSTRAINT fk_bhi_bill FOREIGN KEY (BillID) REFERENCES KNS_Bill(ID);
-- ALTER TABLE KNS_BillHistoryInitiator ADD CONSTRAINT fk_bhi_person FOREIGN KEY (PersonID) REFERENCES KNS_Person(ID);

-- -- Foreign Key Constraints for KNS_BillInitiator
-- ALTER TABLE KNS_BillInitiator ADD CONSTRAINT fk_bi_bill FOREIGN KEY (BillID) REFERENCES KNS_Bill(ID);
-- ALTER TABLE KNS_BillInitiator ADD CONSTRAINT fk_bi_person FOREIGN KEY (PersonID) REFERENCES KNS_Person(ID);

-- -- Foreign Key Constraints for KNS_BillName
-- ALTER TABLE KNS_BillName ADD CONSTRAINT fk_bn_bill FOREIGN KEY (BillID) REFERENCES KNS_Bill(ID);

-- -- Foreign Key Constraints for KNS_BillSplit
-- ALTER TABLE KNS_BillSplit ADD CONSTRAINT fk_bs_main_bill FOREIGN KEY (MainBillID) REFERENCES KNS_Bill(ID);
-- ALTER TABLE KNS_BillSplit ADD CONSTRAINT fk_bs_split_bill FOREIGN KEY (SplitBillID) REFERENCES KNS_Bill(ID);

-- -- Foreign Key Constraints for KNS_BillUnion
-- ALTER TABLE KNS_BillUnion ADD CONSTRAINT fk_bu_main_bill FOREIGN KEY (MainBillID) REFERENCES KNS_Bill(ID);
-- ALTER TABLE KNS_BillUnion ADD CONSTRAINT fk_bu_union_bill FOREIGN KEY (UnionBillID) REFERENCES KNS_Bill(ID);

-- -- Foreign Key Constraints for KNS_CmtSessionItem
-- ALTER TABLE KNS_CmtSessionItem ADD CONSTRAINT fk_csi_session FOREIGN KEY (CommitteeSessionID) REFERENCES KNS_CommitteeSession(ID);
-- ALTER TABLE KNS_CmtSessionItem ADD CONSTRAINT fk_csi_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);
-- ALTER TABLE KNS_CmtSessionItem ADD CONSTRAINT fk_csi_itemtype FOREIGN KEY (ItemTypeID) REFERENCES KNS_ItemType(ID);

-- -- Foreign Key Constraints for KNS_CmtSiteCode
-- ALTER TABLE KNS_CmtSiteCode ADD CONSTRAINT fk_csc_session FOREIGN KEY (KnsID) REFERENCES KNS_CommitteeSession(ID);

-- -- Foreign Key Constraints for KNS_Committee
-- ALTER TABLE KNS_Committee ADD CONSTRAINT fk_committee_parent FOREIGN KEY (ParentCommitteeID) REFERENCES KNS_Committee(ID);

-- -- Foreign Key Constraints for KNS_CommitteeSession
-- ALTER TABLE KNS_CommitteeSession ADD CONSTRAINT fk_cs_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);
-- ALTER TABLE KNS_CommitteeSession ADD CONSTRAINT fk_cs_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);

-- -- Foreign Key Constraints for Documents
-- ALTER TABLE KNS_DocumentAgenda ADD CONSTRAINT fk_doc_agenda FOREIGN KEY (AgendaID) REFERENCES KNS_Agenda(ID);
-- ALTER TABLE KNS_DocumentBill ADD CONSTRAINT fk_doc_bill FOREIGN KEY (BillID) REFERENCES KNS_Bill(ID);
-- ALTER TABLE KNS_DocumentCommitteeSession ADD CONSTRAINT fk_doc_cs FOREIGN KEY (CommitteeSessionID) REFERENCES KNS_CommitteeSession(ID);
-- ALTER TABLE KNS_DocumentIsraelLaw ADD CONSTRAINT fk_doc_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);
-- ALTER TABLE KNS_DocumentPlenumSession ADD CONSTRAINT fk_doc_ps FOREIGN KEY (PlenumSessionID) REFERENCES KNS_PlenumSession(ID);
-- ALTER TABLE KNS_DocumentQuery ADD CONSTRAINT fk_doc_query FOREIGN KEY (QueryID) REFERENCES KNS_Query(ID);
-- ALTER TABLE KNS_DocumentSecondaryLaw ADD CONSTRAINT fk_doc_sl FOREIGN KEY (SecondaryLawID) REFERENCES KNS_SecondaryLaw(ID);

-- -- Foreign Key Constraints for KNS_IsraelLaw
-- ALTER TABLE KNS_IsraelLawBinding ADD CONSTRAINT fk_ilb_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);
-- ALTER TABLE KNS_IsraelLawClassificiation ADD CONSTRAINT fk_ilc_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);
-- ALTER TABLE KNS_IsraelLawLawCorrections ADD CONSTRAINT fk_illc_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);
-- ALTER TABLE KNS_IsraelLawLawCorrections ADD CONSTRAINT fk_illc_lc FOREIGN KEY (LawCorrectionID) REFERENCES KNS_LawCorrections(ID);
-- ALTER TABLE KNS_IsraelLawMinistry ADD CONSTRAINT fk_ilm_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);
-- ALTER TABLE KNS_IsraelLawName ADD CONSTRAINT fk_iln_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);
-- ALTER TABLE KNS_LawBinding ADD CONSTRAINT fk_lb_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);

-- -- Foreign Key Constraints for KNS_LawCorrections
-- ALTER TABLE KNS_LawCorrections ADD CONSTRAINT fk_lc_bill FOREIGN KEY (BillID) REFERENCES KNS_Bill(ID);
-- ALTER TABLE KNS_LawCorrections ADD CONSTRAINT fk_lc_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);

-- -- Foreign Key Constraints for KNS_JointCommittee
-- ALTER TABLE KNS_JointCommittee ADD CONSTRAINT fk_jc_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);
-- ALTER TABLE KNS_JointCommittee ADD CONSTRAINT fk_jc_participant FOREIGN KEY (ParticipantCommitteeID) REFERENCES KNS_Committee(ID);

-- -- Foreign Key Constraints for KNS_PersonToPosition
-- ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_person FOREIGN KEY (PersonID) REFERENCES KNS_Person(ID);
-- ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_position FOREIGN KEY (PositionID) REFERENCES KNS_Position(ID);
-- ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_ministry FOREIGN KEY (GovMinistryID) REFERENCES KNS_GovMinistry(ID);
-- ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_faction FOREIGN KEY (FactionID) REFERENCES KNS_Faction(ID);
-- ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);

-- -- Foreign Key Constraints for KNS_PlenumVote & Results
-- ALTER TABLE KNS_PlenumVote ADD CONSTRAINT fk_pv_session FOREIGN KEY (SessionID) REFERENCES KNS_PlenumSession(ID);
-- ALTER TABLE KNS_PlenumVoteResult ADD CONSTRAINT fk_pvr_vote FOREIGN KEY (VoteID) REFERENCES KNS_PlenumVote(ID);
-- ALTER TABLE KNS_PlenumVoteResult ADD CONSTRAINT fk_pvr_person FOREIGN KEY (MkID) REFERENCES KNS_Person(ID);

-- -- Foreign Key Constraints for KNS_PlmSessionItem
-- ALTER TABLE KNS_PlmSessionItem ADD CONSTRAINT fk_psi_session FOREIGN KEY (PlenumSessionID) REFERENCES KNS_PlenumSession(ID);
-- ALTER TABLE KNS_PlmSessionItem ADD CONSTRAINT fk_psi_itemtype FOREIGN KEY (ItemTypeID) REFERENCES KNS_ItemType(ID);
-- ALTER TABLE KNS_PlmSessionItem ADD CONSTRAINT fk_psi_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);

-- -- Foreign Key Constraints for KNS_Query
-- ALTER TABLE KNS_Query ADD CONSTRAINT fk_query_person FOREIGN KEY (PersonID) REFERENCES KNS_Person(ID);
-- ALTER TABLE KNS_Query ADD CONSTRAINT fk_query_ministry FOREIGN KEY (GovMinistryID) REFERENCES KNS_GovMinistry(ID);
-- ALTER TABLE KNS_Query ADD CONSTRAINT fk_query_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);

-- -- Foreign Key Constraints for Secondary Laws
-- ALTER TABLE KNS_SecLawAuthorizingLaw ADD CONSTRAINT fk_slal_sl FOREIGN KEY (SecondaryLawID) REFERENCES KNS_SecondaryLaw(ID);
-- ALTER TABLE KNS_SecLawRegulator ADD CONSTRAINT fk_slr_sl FOREIGN KEY (SecondaryLawID) REFERENCES KNS_SecondaryLaw(ID);

-- ALTER TABLE KNS_SecondaryLaw ADD CONSTRAINT fk_sl_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);

-- ALTER TABLE KNS_SecToSecBinding ADD CONSTRAINT fk_stsb_sl_child FOREIGN KEY (SecChildID) REFERENCES KNS_SecondaryLaw(ID);
-- ALTER TABLE KNS_SecToSecBinding ADD CONSTRAINT fk_stsb_sl_parent FOREIGN KEY (SecParentID) REFERENCES KNS_SecondaryLaw(ID);
-- ALTER TABLE KNS_SecToSecBinding ADD CONSTRAINT fk_stsb_sl_main FOREIGN KEY (SecMainID) REFERENCES KNS_SecondaryLaw(ID);



-- foreign keys added at the start - sprint 1 --

-- Foreign Key Constraints for KNS_Bill
ALTER TABLE KNS_Bill ADD CONSTRAINT fk_bill_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);
ALTER TABLE KNS_Bill ADD CONSTRAINT fk_bill_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);

-- Foreign Key Constraints for KNS_BillHistoryInitiator
ALTER TABLE KNS_BillHistoryInitiator ADD CONSTRAINT fk_bhi_bill FOREIGN KEY (BillID) REFERENCES KNS_Bill(ID);
ALTER TABLE KNS_BillHistoryInitiator ADD CONSTRAINT fk_bhi_person FOREIGN KEY (PersonID) REFERENCES KNS_Person(ID);

-- Foreign Key Constraints for KNS_BillInitiator
ALTER TABLE KNS_BillInitiator ADD CONSTRAINT fk_bi_bill FOREIGN KEY (BillID) REFERENCES KNS_Bill(ID);
ALTER TABLE KNS_BillInitiator ADD CONSTRAINT fk_bi_person FOREIGN KEY (PersonID) REFERENCES KNS_Person(ID);

-- Foreign Key Constraints for KNS_Committee
ALTER TABLE KNS_Committee ADD CONSTRAINT fk_committee_parent FOREIGN KEY (ParentCommitteeID) REFERENCES KNS_Committee(ID);

-- Foreign Key Constraints for KNS_CommitteeSession
ALTER TABLE KNS_CommitteeSession ADD CONSTRAINT fk_cs_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);
ALTER TABLE KNS_CommitteeSession ADD CONSTRAINT fk_cs_status FOREIGN KEY (StatusID) REFERENCES KNS_Status(ID);

-- Foreign Key Constraints for Documents
ALTER TABLE KNS_DocumentCommitteeSession ADD CONSTRAINT fk_doc_cs FOREIGN KEY (CommitteeSessionID) REFERENCES KNS_CommitteeSession(ID);
ALTER TABLE KNS_DocumentPlenumSession ADD CONSTRAINT fk_doc_ps FOREIGN KEY (PlenumSessionID) REFERENCES KNS_PlenumSession(ID);

-- Foreign Key Constraints for KNS_IsraelLaw
ALTER TABLE KNS_IsraelLawClassificiation ADD CONSTRAINT fk_ilc_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);
ALTER TABLE KNS_IsraelLawMinistry ADD CONSTRAINT fk_ilm_il FOREIGN KEY (IsraelLawID) REFERENCES KNS_IsraelLaw(ID);

-- Foreign Key Constraints for KNS_PersonToPosition
ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_person FOREIGN KEY (PersonID) REFERENCES KNS_Person(ID);
ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_position FOREIGN KEY (PositionID) REFERENCES KNS_Position(ID);
ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_ministry FOREIGN KEY (GovMinistryID) REFERENCES KNS_GovMinistry(ID);
ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_faction FOREIGN KEY (FactionID) REFERENCES KNS_Faction(ID);
ALTER TABLE KNS_PersonToPosition ADD CONSTRAINT fk_ptp_committee FOREIGN KEY (CommitteeID) REFERENCES KNS_Committee(ID);

