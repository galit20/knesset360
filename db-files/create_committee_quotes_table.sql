CREATE TABLE committee_quotes_table (
    "index" INTEGER PRIMARY KEY,
    "speaker" TEXT,
    "raw_text" TEXT,
    "type_info" TEXT,
    "document_committee_session_id" INTEGER,
    "start_date" TIMESTAMP
);

ALTER TABLE committee_quotes_table
ADD CONSTRAINT unique_doc_session
UNIQUE ("DocumentCommitteeSessionID", "Index");

