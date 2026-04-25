document.addEventListener('DOMContentLoaded', () => {
    // API Configuration - Replace with your actual GAS Web App URL
    const API_URL = 'https://script.google.com/macros/s/AKfycbx8zQWxQw2YUbreWgkeELi7gj50RQHxquL7_7OnvyaOvegsCod9m0lvtma5kuiI-asb/exec';

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
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        animateObserver.observe(element);
    });

    // Add scroll listener for header styling
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

    // Load News from API
    async function fetchAndRenderNews() {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;

        try {
            const response = await fetch(`${API_URL}?type=news`);
            const newsList = await response.json();

            if (!newsList || newsList.length === 0) {
                newsContainer.innerHTML = '<p class="no-news">現在、お知らせはありません。</p>';
            } else {
                let html = '<ul class="news-list">';
                newsList.forEach(news => {
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

                // Add toggle functionality
                document.querySelectorAll('.news-item__toggle').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const item = this.closest('.news-item');
                        item.classList.toggle('is-open');
                        this.textContent = item.classList.contains('is-open') ? '▲' : '▼';
                    });
                });
            }
        } catch (error) {
            console.error('News fetch error:', error);
            newsContainer.innerHTML = '<p class="no-news">お知らせの読み込みに失敗しました。</p>';
        }
    }

    // Load and Handle Customer Reviews from API
    async function fetchAndRenderReviews() {
        const reviewsContainer = document.getElementById('reviewsContainer');
        if (!reviewsContainer) return;

        try {
            const response = await fetch(`${API_URL}?type=reviews`);
            const reviews = await response.json();

            if (!reviews || reviews.length === 0) {
                reviewsContainer.innerHTML = '<p class="no-reviews">まだレビューがありません。最初のレビューを投稿してみませんか？</p>';
            } else {
                let html = `
                    <div class="reviews-slider-wrap">
                        <button class="reviews-nav reviews-nav--prev" type="button" aria-label="前のレビュー">＜</button>
                        <div class="reviews-slider">
                            <div class="reviews-track${reviews.length > 1 ? ' is-animated' : ''}">
                `;
                const renderReview = (review) => {
                    const rating = parseInt(review.rating, 10) || 5;
                    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
                    return `
                        <div class="review-item">
                            <div class="review-item__header">
                                <div class="review-item__name">${review.name}</div>
                                <div class="review-item__meta">
                                    <span class="review-item__stars">${stars}</span>
                                    <span class="review-item__date">${review.date}</span>
                                </div>
                            </div>
                            <div class="review-item__body">
                                ${review.comment ? review.comment.replace(/\n/g, '<br>') : ''}
                            </div>
                        </div>
                    `;
                };

                reviews.forEach(review => {
                    html += renderReview(review);
                });

                if (reviews.length > 1) {
                    reviews.forEach(review => {
                        html += renderReview(review);
                    });
                }

                html += `
                            </div>
                        </div>
                        <button class="reviews-nav reviews-nav--next" type="button" aria-label="次のレビュー">＞</button>
                    </div>
                `;
                reviewsContainer.innerHTML = html;

                const slider = reviewsContainer.querySelector('.reviews-slider');
                const track = reviewsContainer.querySelector('.reviews-track');
                const prevBtn = reviewsContainer.querySelector('.reviews-nav--prev');
                const nextBtn = reviewsContainer.querySelector('.reviews-nav--next');
                const firstCard = reviewsContainer.querySelector('.review-item');

                if (slider && track && prevBtn && nextBtn && firstCard) {
                    const getStep = () => firstCard.getBoundingClientRect().width + 20;
                    let autoResumeTimer;

                    const pauseAuto = () => {
                        track.classList.remove('is-animated');
                        clearTimeout(autoResumeTimer);
                    };

                    const resumeAuto = () => {
                        if (reviews.length > 1) {
                            autoResumeTimer = setTimeout(() => {
                                track.classList.add('is-animated');
                                slider.scrollTo({ left: 0, behavior: 'auto' });
                            }, 4000);
                        }
                    };

                    const slideBy = (direction) => {
                        pauseAuto();
                        slider.scrollBy({
                            left: getStep() * direction,
                            behavior: 'smooth'
                        });
                        resumeAuto();
                    };

                    prevBtn.addEventListener('click', () => slideBy(-1));
                    nextBtn.addEventListener('click', () => slideBy(1));

                    slider.addEventListener('mouseenter', pauseAuto);
                    slider.addEventListener('mouseleave', resumeAuto);
                }
            }
        } catch (error) {
            console.error('Reviews fetch error:', error);
            reviewsContainer.innerHTML = '<p class="no-reviews">レビューの読み込みに失敗しました。</p>';
        }
    }

    // Initial load
    fetchAndRenderNews();
    fetchAndRenderReviews();

    // Handle new review submission to API
    const submitReviewForm = document.getElementById('submitReviewForm');
    if (submitReviewForm) {
        submitReviewForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = submitReviewForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            const name = document.getElementById('reviewerName').value;
            const rating = document.getElementById('reviewRating').value;
            const comment = document.getElementById('reviewComment').value;

            const today = new Date();
            const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

            const payload = {
                type: 'reviews',
                action: 'create',
                name: name,
                rating: rating,
                date: formattedDate,
                comment: comment,
                id: Date.now().toString()
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (result.success) {
                    alert('レビューを投稿しました！ありがとうございます。');
                    submitReviewForm.reset();
                    fetchAndRenderReviews();
                } else {
                    throw new Error(result.error || 'Unknown error');
                }
            } catch (error) {
                console.error('Submit error:', error);
                alert('投稿に失敗しました。時間をおいて再度お試しください。');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});

