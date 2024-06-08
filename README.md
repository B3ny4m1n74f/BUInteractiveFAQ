# BUInteractiveFAQ
Project Description

The Boston University Metropolitan College (BU MET) website sees a high volume of student traffic through its Frequently Asked Questions (FAQ) section. To enhance the student experience, we propose the integration of a chatbot that offers human-like interaction. This chatbot will engage students in natural conversations, encouraging them to learn more about BU MET and explore additional courses.

The entry point into the proposed application will be through the existing FAQ page at BU MET FAQ, as illustrated by the arrow at the bottom of the page.

The project builds on the QBot app, initially launched by MET CS 633 students in Fall 2023 (QBot). In the context of several MET courses, students using QBot can scan through a set of a hundred questions before transitioning into the generative mode. The left figure below shows the steps a student takes to find a response or converse with QBot. The right figure illustrates the Ingestion and Embeddings creation process.

This implementation will demonstrate the benefits of integrating advanced AI-driven tools into educational settings, providing students with personalized and engaging learning experiences.

Project Phases

The project will be divided into four phases:

    Phase 1: Tailoring and Data Migration
        Customize the existing QBot application and train it on new data relevant to Metropolitan College, instead of individual classes.
        This phase involves software development, UI adjustments, and data migration.

    Phase 2: Ensuring Semantic Matching Performance
        Ensure that semantic matching performs reasonably well, a precursor to the generative mode.
        This phase enables users to ask questions that are somewhat similar to those in the maintained dataset. Upon satisfactory performance, the project can proceed to Phase 4.

    Phase 3: Evaluating Generative Mode
        Evaluate the generative mode using the RAGAs framework to measure 'faithfulness' criteria.
        Determine if the underlying Q&A data is sufficient to support the generative mode.

    Phase 4: Integration and Collaboration
        Collaborate with BU MET staff to integrate the new application into the external-facing site.
        Ensure verification and approval of this addition, maintaining all Q&As in a single repository.
