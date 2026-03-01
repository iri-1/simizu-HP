document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const globalNav = document.getElementById('global-nav');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (hamburger && globalNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            globalNav.classList.toggle('is-active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('is-active');
                globalNav.classList.remove('is-active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const animateObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Optional: Stop observing once animated
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        animateObserver.observe(element);
    });

    // Add scroll listener for header styling (optional, e.g., shrinking header on scroll)
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '5px 40px';
            header.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
        } else {
            header.style.padding = '15px 40px';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
        }
    });

    // Load News on index.html
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        let newsList = JSON.parse(localStorage.getItem('shimizuNews')) || [];

        // Populate sample news if totally empty (for demonstration)
        if (newsList.length === 0 && !localStorage.getItem('shimizuNews_initialized')) {
            newsList = [
                {
                    date: '2026.03.01',
                    category: 'お知らせ',
                    title: 'Webサイトをリニューアルしました！',
                    content: 'しみず整骨院の公式Webサイトを開設しました。Web予約も可能になり、より便利にご利用いただけます。皆様のご来院を心よりお待ちしております。',
                    id: 1
                },
                {
                    date: '2026.03.15',
                    category: '休診情報',
                    title: '今月の休診日について',
                    content: '今月は毎週日曜日に加え、20日（金・祝）も休診とさせていただきます。ご迷惑をおかけしますが、よろしくお願いいたします。',
                    id: 2
                }
            ];
            localStorage.setItem('shimizuNews', JSON.stringify(newsList));
            localStorage.setItem('shimizuNews_initialized', 'true');
        }

        if (newsList.length === 0) {
            newsContainer.innerHTML = '<p class="no-news">現在、お知らせはありません。</p>';
        } else {
            let html = '<ul class="news-list">';
            newsList.forEach(news => { // Show all items, relying on CSS scroll
                const hasContent = news.content && news.content.trim() !== '';
                html += `
                    <li class="news-item">
                        <div class="news-item__meta">
                            <span class="news-item__date">${news.date}</span>
                            ${news.category ? `<span class="news-item__badge">${news.category}</span>` : ''}
                        </div>
                        <div class="news-item__title">
                            ${news.title}
                            ${hasContent ? `
                            <div class="news-item__content">
                                ${news.content.replace(/\n/g, '<br>')}
                            </div>
                            ` : ''}
                        </div>
                        ${hasContent ? `<button class="news-item__toggle" aria-label="詳細を開閉する">▼</button>` : ''}
                    </li>
                `;
            });
            html += '</ul>';
            newsContainer.innerHTML = html;

            // Add toggle functionality for details
            document.querySelectorAll('.news-item__toggle').forEach(btn => {
                btn.addEventListener('click', function () {
                    const item = this.closest('.news-item');
                    item.classList.toggle('is-open');
                    this.textContent = item.classList.contains('is-open') ? '▲' : '▼';
                });
            });
        }
    }

    // Load and Handle Customer Reviews
    const reviewsContainer = document.getElementById('reviewsContainer');
    const submitReviewForm = document.getElementById('submitReviewForm');

    function renderReviews() {
        if (!reviewsContainer) return;

        let reviews = JSON.parse(localStorage.getItem('shimizuReviews')) || [];

        // Add sample review if empty
        if (reviews.length === 0 && !localStorage.getItem('shimizuReviews_initialized')) {
            reviews = [
                {
                    name: 'K.M様',
                    rating: 5,
                    date: '2026.02.20',
                    comment: '長年の腰の痛みが嘘のように軽くなりました！15分という短い時間ですが、的確に痛いところを見つけて施術してくださいます。院内も清潔で木の香りに癒やされます。'
                },
                {
                    name: '匿名希望',
                    rating: 4,
                    date: '2026.02.28',
                    comment: '先生がとても優しく丁寧に説明してくれたのが良かったです。家でのストレッチ方法も教えてもらえたので頑張って続けます。'
                }
            ];
            localStorage.setItem('shimizuReviews', JSON.stringify(reviews));
            localStorage.setItem('shimizuReviews_initialized', 'true');
        }

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p class="no-reviews">まだレビューがありません。最初のレビューを投稿してみませんか？</p>';
        } else {
            let html = '';
            reviews.forEach(review => {
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                html += `
                    <div class="review-item">
                        <div class="review-item__header">
                            <div class="review-item__name">${review.name}</div>
                            <div class="review-item__meta">
                                <span class="review-item__stars">${stars}</span>
                                <span class="review-item__date">${review.date}</span>
                            </div>
                        </div>
                        <div class="review-item__body">
                            ${review.comment.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
            });
            reviewsContainer.innerHTML = html;
        }
    }

    // Initial render
    renderReviews();

    // Handle new review submission
    if (submitReviewForm) {
        submitReviewForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('reviewerName').value;
            const rating = parseInt(document.getElementById('reviewRating').value, 10);
            const comment = document.getElementById('reviewComment').value;

            const today = new Date();
            const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

            const newReview = {
                name: name,
                rating: rating,
                date: formattedDate,
                comment: comment
            };

            let reviews = JSON.parse(localStorage.getItem('shimizuReviews')) || [];
            reviews.unshift(newReview); // Add to top

            localStorage.setItem('shimizuReviews', JSON.stringify(reviews));

            // Re-render
            renderReviews();

            // Reset and feedback
            submitReviewForm.reset();
            alert('レビューを投稿しました！ありがとうございます。');
        });
    }
});
