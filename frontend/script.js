// 単語の辞書データ（プロトタイプ用）
const dictionary = {
    artificial: {
        pronunciation: "/ˌɑːrtɪˈfɪʃl/",
        definition: "人工の、人造の",
        example: "This is artificial intelligence, not human intelligence."
    },
    intelligence: {
        pronunciation: "/ɪnˈtelɪdʒəns/",
        definition: "知能、知性、諜報",
        example: "Human intelligence is still superior in creative tasks."
    },
    fascinated: {
        pronunciation: "/ˈfæsɪneɪtɪd/",
        definition: "魅了された、興味深く思った",
        example: "I was fascinated by the documentary about space."
    },
    decades: {
        pronunciation: "/ˈdekeɪdz/",
        definition: "数十年間",
        example: "This problem has existed for decades."
    },
    technology: {
        pronunciation: "/tekˈnɑːlədʒi/",
        definition: "技術、テクノロジー",
        example: "Modern technology makes our lives easier."
    },
    evolve: {
        pronunciation: "/ɪˈvɑːlv/",
        definition: "進化する、発展する",
        example: "Languages evolve over time."
    },
    remarkable: {
        pronunciation: "/rɪˈmɑːrkəbl/",
        definition: "注目すべき、素晴らしい",
        example: "She made remarkable progress in her studies."
    },
    advances: {
        pronunciation: "/ədˈvænsɪz/",
        definition: "進歩、前進",
        example: "Recent advances in medicine have saved many lives."
    },
    automation: {
        pronunciation: "/ˌɔːtəˈmeɪʃn/",
        definition: "自動化",
        example: "Automation has changed manufacturing processes."
    },
    developments: {
        pronunciation: "/dɪˈveləpments/",
        definition: "発展、開発",
        example: "There are exciting developments in renewable energy."
    },
    potential: {
        pronunciation: "/pəˈtenʃl/",
        definition: "可能性、潜在能力",
        example: "This student has great potential."
    },
    transform: {
        pronunciation: "/trænsˈfɔːrm/",
        definition: "変換する、変革する",
        example: "Digital technology will transform education."
    },
    industries: {
        pronunciation: "/ˈɪndəstriz/",
        definition: "産業、工業",
        example: "Many industries are adopting green practices."
    },
    healthcare: {
        pronunciation: "/ˈhelθker/",
        definition: "医療、ヘルスケア",
        example: "Healthcare costs are rising globally."
    },
    transportation: {
        pronunciation: "/ˌtrænspərˈteɪʃn/",
        definition: "交通、輸送",
        example: "Public transportation reduces traffic congestion."
    },
    crucial: {
        pronunciation: "/ˈkruːʃl/",
        definition: "重要な、決定的な",
        example: "It's crucial to arrive on time for the interview."
    },
    ethical: {
        pronunciation: "/ˈeθɪkl/",
        definition: "倫理的な、道徳的な",
        example: "We must consider the ethical implications of this decision."
    },
    implications: {
        pronunciation: "/ˌɪmplɪˈkeɪʃnz/",
        definition: "含意、影響、結果",
        example: "The implications of this discovery are enormous."
    },
    powerful: {
        pronunciation: "/ˈpaʊərfl/",
        definition: "強力な、力強い",
        example: "This is a powerful tool for data analysis."
    }
};

// 保存された単語を管理する配列
let savedWords = [];

// DOM要素の取得
const wordInfo = document.getElementById('wordInfo');
const selectedWord = document.getElementById('selectedWord');
const pronunciation = document.getElementById('pronunciation');
const definition = document.getElementById('definition');
const example = document.getElementById('example');
const addWordBtn = document.getElementById('addWordBtn');
const savedWordsContainer = document.getElementById('savedWords');

// 現在選択中の単語
let currentWord = '';

// 単語クリックイベントの設定
document.addEventListener('DOMContentLoaded', function() {
    const clickableWords = document.querySelectorAll('.clickable-word');
    
    clickableWords.forEach(word => {
        word.addEventListener('click', function() {
            const wordText = this.getAttribute('data-word');
            selectWord(wordText, this);
        });
    });

    // 学習リストに追加ボタンのイベント
    addWordBtn.addEventListener('click', function() {
        if (currentWord && !savedWords.includes(currentWord)) {
            savedWords.push(currentWord);
            updateSavedWordsList();
            
            // ボタンのテキストを一時的に変更
            const originalText = addWordBtn.textContent;
            addWordBtn.textContent = '追加完了! ✅';
            addWordBtn.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                addWordBtn.textContent = originalText;
                addWordBtn.style.backgroundColor = '';
            }, 1500);
        }
    });
});

// 単語選択機能
function selectWord(word, element) {
    // 以前にハイライトされた単語のスタイルをリセット
    document.querySelectorAll('.clickable-word.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });

    // 新しい単語をハイライト
    element.classList.add('highlighted');

    currentWord = word;
    
    if (dictionary[word]) {
        const wordData = dictionary[word];
        
        selectedWord.textContent = word.charAt(0).toUpperCase() + word.slice(1);
        pronunciation.textContent = wordData.pronunciation;
        definition.textContent = wordData.definition;
        example.textContent = `例文: ${wordData.example}`;
        
        wordInfo.classList.add('active');
        
        // ボタンの状態を更新
        if (savedWords.includes(word)) {
            addWordBtn.textContent = '登録済み ✅';
            addWordBtn.disabled = true;
            addWordBtn.style.backgroundColor = '#6c757d';
        } else {
            addWordBtn.textContent = '学習リストに追加 ⭐';
            addWordBtn.disabled = false;
            addWordBtn.style.backgroundColor = '';
        }
    }
}

// 保存された単語リストの更新
function updateSavedWordsList() {
    if (savedWords.length === 0) {
        savedWordsContainer.innerHTML = `
            <p style="color: #666; font-style: italic; font-size: 0.9rem;">
                まだ単語が登録されていません
            </p>
        `;
    } else {
        savedWordsContainer.innerHTML = savedWords.map(word => `
            <div class="saved-word">
                <strong>${word.charAt(0).toUpperCase() + word.slice(1)}</strong>
                <br>
                <small>${dictionary[word].definition}</small>
            </div>
        `).join('');
    }
}