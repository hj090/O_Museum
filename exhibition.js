document.addEventListener('DOMContentLoaded', function () {
            
            const tabs = document.querySelectorAll('.tab-link');
            const sections = document.querySelectorAll('.tab-sec');

            tabs.forEach(tab => {
                tab.addEventListener('click', function (e) {
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            const observerOptions = {
                root: null,
                rootMargin: '-100px 0px -50% 0px', 
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const currentId = entry.target.getAttribute('id');
                        tabs.forEach(t => t.classList.remove('active'));
                        const activeTab = document.querySelector(`.tab-link[href="#${currentId}"]`);
                        if (activeTab) activeTab.classList.add('active');
                    }
                });
            }, observerOptions);

            sections.forEach(section => {
                observer.observe(section);
            });


            const itemObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            const items = document.querySelectorAll('.exhibiton-item');
            items.forEach(item => {
                itemObserver.observe(item);
            });

            const modal = document.getElementById('mapModal');
            const modalImg = document.getElementById('modalImg');
            const closeBtn = document.querySelector('.close-btn');
            const mapTriggers = document.querySelectorAll('.map-trigger');

            mapTriggers.forEach(trigger => {
                trigger.addEventListener('click', function() {
                    const hiddenImg = this.querySelector('img');
                    if (hiddenImg) {
                        modal.classList.add('active');
                        modalImg.src = hiddenImg.src;
                    }
                });
            });

            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
            });

            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });

        });