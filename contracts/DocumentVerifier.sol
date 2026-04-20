// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentVerifier {

    struct Document {
        uint256 id;
        address uploader;
        string ipfsHash;
        bytes32 fileHash;
        uint256 parentId;
        uint256 timestamp;
        string docKey;   // stable identity (filename)
        string subject;  // ✅ NEW: subject/topic metadata (e.g. "Mathematics", "Physics")
    }

    uint256 public docCount;

    mapping(uint256 => Document) public documents;
    mapping(bytes32 => uint256) public hashToId;
    mapping(string => uint256) public latestByKey;

    // ✅ NEW: subject → list of document IDs (only root/first versions, not revisions)
    mapping(string => uint256[]) private subjectDocIds;

    // ✅ NEW: track all known subjects for enumeration
    string[] public allSubjects;
    mapping(string => bool) private subjectExists;

    event DocumentUploaded(
        uint256 indexed id,
        address indexed uploader,
        string docKey,
        string subject,
        uint256 parentId,
        uint256 timestamp
    );

    function uploadDocument(
        string memory ipfsHash,
        bytes32 fileHash,
        string memory docKey,
        uint256 parentId,
        string memory subject  // ✅ NEW parameter
    ) public {

        // 🔒 Only original uploader can push a revision
        if (parentId != 0) {
            require(
                documents[parentId].uploader == msg.sender,
                "Only original uploader can update"
            );
        }

        docCount++;

        documents[docCount] = Document({
            id: docCount,
            uploader: msg.sender,
            ipfsHash: ipfsHash,
            fileHash: fileHash,
            parentId: parentId,
            timestamp: block.timestamp,
            docKey: docKey,
            subject: subject  // ✅ stored on-chain
        });

        hashToId[fileHash] = docCount;
        latestByKey[docKey] = docCount;

        // ✅ Only index root documents under subject (not revisions)
        // This keeps browse-by-subject clean — you see one entry per document,
        // not one entry per version.
        if (parentId == 0) {
            subjectDocIds[subject].push(docCount);

            if (!subjectExists[subject]) {
                subjectExists[subject] = true;
                allSubjects.push(subject);
            }
        }

        emit DocumentUploaded(docCount, msg.sender, docKey, subject, parentId, block.timestamp);
    }

    function verifyDocument(bytes32 fileHash) public view returns (bool) {
        return hashToId[fileHash] != 0;
    }

    function getDocumentByHash(bytes32 fileHash)
        public
        view
        returns (Document memory)
    {
        require(hashToId[fileHash] != 0, "Not found");
        return documents[hashToId[fileHash]];
    }

    function getDocument(uint256 id)
        public
        view
        returns (Document memory)
    {
        return documents[id];
    }

    function getLatestByKey(string memory key)
        public
        view
        returns (uint256)
    {
        return latestByKey[key];
    }

    // ✅ NEW: returns all root document IDs for a subject
    function getDocumentsBySubject(string memory subject)
        public
        view
        returns (uint256[] memory)
    {
        return subjectDocIds[subject];
    }

    // ✅ NEW: returns all known subjects
    function getAllSubjects()
        public
        view
        returns (string[] memory)
    {
        return allSubjects;
    }

    // ✅ NEW: returns full Document structs for a subject (convenience for frontend)
    function getDocumentDetailsBySubject(string memory subject)
        public
        view
        returns (Document[] memory)
    {
        uint256[] memory ids = subjectDocIds[subject];
        Document[] memory docs = new Document[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            // Return the LATEST version of each document, not the original
            uint256 latestId = latestByKey[documents[ids[i]].docKey];
            docs[i] = documents[latestId];
        }
        return docs;
    }

    function getHistory(uint256 id)
        public
        view
        returns (Document[] memory)
    {
        uint256 count = 0;
        uint256 current = id;

        while (current != 0) {
            count++;
            current = documents[current].parentId;
        }

        Document[] memory history = new Document[](count);

        current = id;
        for (uint256 i = 0; i < count; i++) {
            history[i] = documents[current];
            current = documents[current].parentId;
        }

        return history;
    }
}
