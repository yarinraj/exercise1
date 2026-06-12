import React from 'react';

const BackgroundDoodles = () => {
    const backgroundDoodles = [
        // top left corner
        { emoji: '🍕', top: '14%', left: '5%', size: '1.4rem', duration: '6s', delay: '-1.5s' },
        { emoji: '🍔', top: '22%', left: '14%', size: '1.6rem', duration: '8s', delay: '-4s' },
        { emoji: '🍣', top: '35%', left: '6%', size: '1.3rem', duration: '7s', delay: '-2.5s' },
        { emoji: '🍩', top: '15%', left: '22%', size: '1.5rem', duration: '9s', delay: '-5s' },

        // top right corner
        { emoji: '🍩', top: '12%', left: '78%', size: '1.5rem', duration: '8.5s', delay: '-3.5s' },
        { emoji: '🍕', top: '28%', left: '88%', size: '1.4rem', duration: '6.5s', delay: '-1s' },
        { emoji: '🍔', top: '38%', left: '75%', size: '1.7rem', duration: '7.5s', delay: '-6s' },
        { emoji: '🍣', top: '18%', left: '92%', size: '1.3rem', duration: '9.5s', delay: '-2s' },

        // middle / central area
        { emoji: '🍟', top: '48%', left: '15%', size: '1.5rem', duration: '7.4s', delay: '-2.8s' },
        { emoji: '🍔', top: '45%', left: '8%', size: '1.5rem', duration: '6.5s', delay: '-0.5s' },

        // middle / central area
        { emoji: '🍟', top: '46%', left: '79%', size: '1.5rem', duration: '6.7s', delay: '-1.9s' },
        { emoji: '🍕', top: '52%', left: '93%', size: '1.3rem', duration: '7s', delay: '-3.8s' },

        // bottom left corner 
        { emoji: '🍣', top: '60%', left: '8%', size: '1.6rem', duration: '7.2s', delay: '-0.5s' },
        { emoji: '🍩', top: '75%', left: '18%', size: '1.4rem', duration: '8.2s', delay: '-4.5s' },
        { emoji: '🌮', top: '79%', left: '26%', size: '1.4rem', duration: '8.3s', delay: '-4.1s' },
        { emoji: '🍕', top: '88%', left: '5%', size: '1.5rem', duration: '6.8s', delay: '-3s' },

        // bottom right corner
        { emoji: '🍔', top: '62%', left: '85%', size: '1.5rem', duration: '7.8s', delay: '-2.2s' },
        { emoji: '🍣', top: '72%', left: '76%', size: '1.4rem', duration: '6.2s', delay: '-4.8s' },
        { emoji: '🌮', top: '81%', left: '85%', size: '1.6rem', duration: '7.9s', delay: '-5.2s' },
        { emoji: '🍩', top: '85%', left: '90%', size: '1.6rem', duration: '8.7s', delay: '-1.2s' },
    ];

    return (
        <>
            {backgroundDoodles.map((doodle, index) => (
                <div
                    key={index}
                    className="bg-doodle-container"
                    style={{
                        position: 'absolute',
                        top: doodle.top,
                        left: doodle.left,
                        zIndex: 1,
                        cursor: 'default',
                    }}
                >
                    <span
                        className="bg-doodle-icon"
                        style={{
                            fontSize: doodle.size,
                            animationDuration: doodle.duration,
                            animationDelay: doodle.delay,
                            display: 'inline-block',
                            cursor: 'default',
                        }}
                    >
                        {doodle.emoji}
                    </span>
                </div>
            ))}
        </>
    );
};

export default BackgroundDoodles;