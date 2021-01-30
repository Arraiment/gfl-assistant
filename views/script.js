<script>
    $(document).ready(function(){
        var choices = [-1, -1, -1];
        if ($(".disabled").length) {
            $(".disabled").each(function(){
              let href = $(this).attr('href').replace('#c', '') - 1;
              choices[href] = $(this).text();
            });
        }
        $(".list-group-item").click(function() {
            let selected = $(this).text();
            let href = $(this).attr('href').replace('#', '');
            switch (parseInt(href)) {
                case 1:
                    choices[0] = selected;
                    break;
                case 2:
                    choices[1] = selected;
                    break;
                case 3:
                    choices[2] = selected;
                    break;
            }
            console.log(choices);
            if (choices.includes(-1) == false) {
                $("#submit").fadeIn(500);
            }
            $(this).parents(".collapse").prev().text(selected);
            if ($(this).parents(".collapse").attr('id') !== "c3") {
                $(this).parents(".card").next().children(".card-header").click();
            } else {
                $(this).parents(".collapse").prev().click();
            }
        });
        $("#submit").click(function() {
            let links = 'one=' + choices[0] + '&two=' + choices[1] + '&three=' + choices[2];
            console.log(links);
            $.post('/result', links).done(function() {
                window.location.href = '/results';
              });
        });
    });
</script>
