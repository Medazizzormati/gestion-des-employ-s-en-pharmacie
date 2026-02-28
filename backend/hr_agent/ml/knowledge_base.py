import json
import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from django.conf import settings

class AIKnowledgeBase:
    """Provides semantic retrieval from various pharmacy datasets"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIKnowledgeBase, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance
    
    def initialize(self):
        if self.initialized:
            return
            
        print("Initializing AI Knowledge Base from massive dataset...")
        self.datasets_dir = os.path.join(settings.BASE_DIR, '..', 'datasets')
        self.knowledge = []
        
        # 1. Load QA Pairs
        qa_path = os.path.join(self.datasets_dir, 'qa_pairs.jsonl')
        if os.path.exists(qa_path):
            with open(qa_path, 'r', encoding='utf-8') as f:
                for line in f:
                    data = json.loads(line)
                    self.knowledge.append({
                        'text': data['question'],
                        'response': {
                            'message': data['answer'],
                            'actions': [],
                            'suggestions': [f"Source: {data.get('source', 'Système')}"]
                        }
                    })
        
        # 2. Load Conversations
        conv_path = os.path.join(self.datasets_dir, 'conversations.jsonl')
        if os.path.exists(conv_path):
            with open(conv_path, 'r', encoding='utf-8') as f:
                # Limit to 5000 for memory efficiency in dev
                for i, line in enumerate(f):
                    if i > 5000: break
                    data = json.loads(line)
                    # Find user and assistant messages
                    user_text = ""
                    assistant_json = {}
                    for msg in data['messages']:
                        if msg['role'] == 'user':
                            user_text = msg['content']
                        elif msg['role'] == 'assistant':
                            try:
                                assistant_json = json.loads(msg['content'])
                            except:
                                assistant_json = {"message": msg['content']}
                    
                    if user_text:
                        self.knowledge.append({
                            'text': user_text,
                            'response': assistant_json
                        })
        
        if not self.knowledge:
            print("Warning: No knowledge found in datasets.")
            self.initialized = True
            return

        # Initialize TF-IDF
        self.texts = [k['text'] for k in self.knowledge]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        self.tfidf_matrix = self.vectorizer.fit_transform(self.texts)
        self.initialized = True
        print(f"Knowledge Base indexed with {len(self.texts)} examples.")
    
    def search(self, query: str, threshold: float = 0.1):
        if not self.initialized:
            self.initialize()
            
        if not self.texts:
            return None
            
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        max_idx = similarities.argmax()
        
        if similarities[max_idx] > threshold:
            return self.knowledge[max_idx]['response']
        return None
